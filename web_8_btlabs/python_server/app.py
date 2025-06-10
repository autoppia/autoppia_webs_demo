import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr, Field
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import os
import time
from loguru import logger
load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:5006", "http://0.0.0.0:5006", "btlabs.ai", "www.btlabs.ai"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL")

# Validate required environment variables
if not all([SMTP_SERVER, SMTP_USERNAME, SMTP_PASSWORD, RECEIVER_EMAIL]):
    missing = [var for var in ["SMTP_SERVER", "SMTP_USERNAME", "SMTP_PASSWORD", "RECEIVER_EMAIL"] if not os.getenv(var)]
    logger.error(f"Missing required environment variables: {', '.join(missing)}")
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

class ContactForm(BaseModel):
    firstName: str = Field(..., max_length=50)
    lastName: str = Field(..., max_length=50)
    email: EmailStr
    message: str = Field(..., max_length=2000)

def create_email(form: ContactForm) -> MIMEMultipart:
    """Create email message from form data"""
    subject = f"New Contact Message from {form.firstName} {form.lastName}"
    body = f"""
    You received a new message from the contact form:

    Name: {form.firstName} {form.lastName}
    Email: {form.email}
    Message:
    {form.message}
    """

    msg = MIMEMultipart()
    msg["From"] = SMTP_USERNAME
    msg["To"] = RECEIVER_EMAIL
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))
    return msg

def send_email_with_retry(msg: MIMEMultipart, max_retries: int = 3, retry_delay: int = 2):
    """Send email with retry mechanism"""
    for attempt in range(max_retries):
        try:
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.sendmail(SMTP_USERNAME, RECEIVER_EMAIL, msg.as_string())
                logger.info("Email sent successfully")
                return
        except smtplib.SMTPException as e:
            logger.error(f"SMTP error on attempt {attempt+1}: {str(e)}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                logger.error(f"All retries failed for email to {RECEIVER_EMAIL}")
                raise
        except (TimeoutError, ConnectionError) as e:
            logger.error(f"Network error on attempt {attempt+1}: {str(e)}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                logger.error("All retries failed due to network issues")
                raise
        except Exception as e:
            logger.error(f"Unexpected error on attempt {attempt+1}: {str(e)}")
            raise

@app.post("/contact")
async def submit_contact_form(form: ContactForm):
    try:
        logger.info(f"Received contact form submission from {form.email}")
        msg = create_email(form)
        send_email_with_retry(msg)
        return {"success": True, "message": "Your message has been sent successfully."}
    except Exception as e:
        logger.exception("Failed to process contact form")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email: {str(e)}. Please try again later."
        )
