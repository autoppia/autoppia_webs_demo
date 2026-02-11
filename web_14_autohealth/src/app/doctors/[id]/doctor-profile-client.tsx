"use client";

import type { Doctor } from "@/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Phone, Mail, MapPin, Clock, Award, BookOpen, Stethoscope } from "lucide-react";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useState, useMemo } from "react";
import { ContactDoctorModal } from "@/components/contact-doctor-modal";
import { DoctorReviewsModal } from "@/components/doctor-reviews-modal";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "education", label: "Education & Certifications" },
  { id: "availability", label: "Availability" },
] as const;

const HEADER_PARTS = [
  { key: "avatar" },
  { key: "details" },
] as const;

const CONTACT_INFO_KEYS = ["location", "phone", "email", "fee"] as const;
type ContactInfoKey = (typeof CONTACT_INFO_KEYS)[number];

const ACTION_KEYS = ["contact", "reviews"] as const;
type ActionKey = (typeof ACTION_KEYS)[number];

function Stars({ value }: { value: number }) {
  const stars = Array.from({ length: 5 }).map((_, i) => {
    const active = value >= i + 1 - 1e-6 || value > i && value < i + 1;
    return (
      <Star key={i} className={`h-4 w-4 ${active ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground"}`} />
    );
  });
  return <div className="flex items-center gap-1">{stars}</div>;
}

export function DoctorProfileClient({ doctor }: { doctor: Doctor }) {
  const dyn = useDynamicSystem();
  const [activeTab, setActiveTab] = useState("overview");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  const orderedTabs = useMemo(() => {
    const order = dyn.v1.changeOrderElements("doctor-profile-tabs", TABS.length);
    return order.map((idx) => TABS[idx]);
  }, [dyn.v1]);

  const orderedHeaderParts = useMemo(() => {
    const order = dyn.v1.changeOrderElements("doctor-profile-header", HEADER_PARTS.length);
    return order.map((idx) => HEADER_PARTS[idx]);
  }, [dyn.v1]);

  const orderedContactKeys = useMemo(() => {
    const order = dyn.v1.changeOrderElements("doctor-contact-info", CONTACT_INFO_KEYS.length);
    return order.map((idx) => CONTACT_INFO_KEYS[idx]);
  }, [dyn.v1]);

  const orderedActionKeys = useMemo(() => {
    const order = dyn.v1.changeOrderElements("doctor-profile-actions", ACTION_KEYS.length);
    return order.map((idx) => ACTION_KEYS[idx]);
  }, [dyn.v1]);

  const handleContactDoctor = () => {
    logEvent(EVENT_TYPES.OPEN_CONTACT_DOCTOR_FORM, { doctor });
    setIsContactModalOpen(true);
  };

  const handleViewReviews = () => {
    setIsReviewsModalOpen(true);
  };

  const contactInfoItemByKey: Record<ContactInfoKey, { icon: React.ReactNode; label: string; value: string }> = {
    location: {
      icon: <MapPin className="h-4 w-4 text-muted-foreground" />,
      label: "Office Location",
      value: doctor.officeLocation || "N/A",
    },
    phone: {
      icon: <Phone className="h-4 w-4 text-muted-foreground" />,
      label: "Phone",
      value: doctor.phone || "N/A",
    },
    email: {
      icon: <Mail className="h-4 w-4 text-muted-foreground" />,
      label: "Email",
      value: doctor.email || "N/A",
    },
    fee: {
      icon: <span className="text-lg">💰</span>,
      label: "Consultation Fee",
      value: doctor.consultationFee != null ? `$${doctor.consultationFee}` : "N/A",
    },
  };

  return (
    <div className="container py-10">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {orderedHeaderParts.map((p, i) => (
            dyn.v1.addWrapDecoy(`profile-header-${p.key}`, (
              <div key={p.key} className={p.key === "avatar" ? "flex-shrink-0" : "flex-1"}>
                {p.key === "avatar" && (
                  <Avatar 
                    src={`/images/doctors/${doctor.id}.jpg`}
                    alt={`${doctor.name} profile photo`}
                    name={doctor.name}
                    className="w-24 h-24 text-2xl"
                    data-testid="doctor-profile-main-avatar"
                    data-agent-id="doctor-profile-header-image"
                  />
                )}
                {p.key === "details" && (
                  <div>
                    <h1 className="text-3xl font-bold">{doctor.name}</h1>
                    <p className="text-xl text-muted-foreground mb-2">{doctor.specialty}</p>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Stars value={doctor.rating} />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                        <span className="text-sm text-muted-foreground">({(doctor.patientReviews || []).length} reviews)</span>
                      </div>
                      <Badge variant="outline">{doctor.experience} years experience</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{doctor.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {(doctor.specialties || []).map((specialty) => (
                        <Badge key={specialty} variant="secondary">{specialty}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ), `profile-header-${p.key}-${i}`)
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orderedContactKeys.map((key, i) => {
              const item = contactInfoItemByKey[key];
              return dyn.v1.addWrapDecoy(`contact-item-${i}`, (
                <div key={key} className="flex items-center gap-3">
                  {item.icon}
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ), `contact-item-${i}`);
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 border-b">
          {orderedTabs.map((tab, i) => (
            dyn.v1.addWrapDecoy(`profile-tab-${i}`, (
              <Button
                key={tab.id}
                id={dyn.v3.getVariant(`profile-tab-${tab.id}`, ID_VARIANTS_MAP, `profile-tab-${tab.id}`)}
                className={cn("rounded-b-none", dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""))}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "education") {
                    logEvent(EVENT_TYPES.VIEW_DOCTOR_EDUCATION, { doctor });
                  }
                  if (tab.id === "availability") {
                    logEvent(EVENT_TYPES.VIEW_DOCTOR_AVAILABILITY, { doctor });
                  }
                }}
              >
                {tab.label}
              </Button>
            ), `profile-tab-${i}`)
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Hospital Affiliations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(doctor.hospitalAffiliations || []).map((hospital) => (
                    <li key={hospital} className="flex items-center gap-2">
                      <span className="text-green-500">🏥</span>
                      <span>{hospital}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">🌐</span>
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(doctor.languages || []).map((language) => (
                    <Badge key={language} variant="outline">{language}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">🛡️</span>
                  Insurance Accepted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(doctor.insuranceAccepted || []).map((insurance) => (
                    <Badge key={insurance} variant="secondary">{insurance}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Awards & Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(doctor.awards || []).map((award) => (
                    <li key={award} className="flex items-center gap-2">
                      <span className="text-yellow-500">🏆</span>
                      <span className="text-sm">{award}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Procedures & Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(doctor.procedures || []).map((procedure, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-blue-500">🔬</span>
                      <span className="text-sm">{procedure}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "education" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(doctor.education || []).map((edu, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">🎓</span>
                      <span className="text-sm">{edu}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">📜</span>
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(doctor.certifications || []).map((cert, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✅</span>
                      <span className="text-sm">{cert}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">📚</span>
                  Publications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(doctor.publications || []).map((pub, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1">📖</span>
                      <span className="text-sm">{pub}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "availability" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Office Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(doctor.availability || {}).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium capitalize">{day}</span>
                    <span className="text-sm text-muted-foreground">{hours}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        {orderedActionKeys.map((key: ActionKey, i) => {
          if (key === "contact") {
            return dyn.v1.addWrapDecoy(`profile-action-${i}`, (
              <div key={key}>
                {dyn.v1.addWrapDecoy("contact-doctor-button", (
                  <Button 
                    id={dyn.v3.getVariant("contact-doctor-button", ID_VARIANTS_MAP, "contact-doctor-button")}
                    className={cn("flex-1 bg-green-600 hover:bg-green-700 text-white", dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""))}
                    data-testid="open-contact-doctor-form-btn"
                    onClick={handleContactDoctor}
                  >
                    {dyn.v3.getVariant("contact_doctor", TEXT_VARIANTS_MAP, "Contact Doctor")}
                  </Button>
                ))}
              </div>
            ), `profile-action-${i}`);
          }
          return dyn.v1.addWrapDecoy(`profile-action-${i}`, (
            <div key={key}>
              {dyn.v1.addWrapDecoy("view-reviews-button", (
                <Button 
                  id={dyn.v3.getVariant("view-reviews-button", ID_VARIANTS_MAP, "view-reviews-button")}
                  className={cn("flex-1", dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""))}
                  variant="outline" 
                  onClick={handleViewReviews}
                >
                  {dyn.v3.getVariant("view_reviews", TEXT_VARIANTS_MAP, "View All Reviews")}
                </Button>
              ))}
            </div>
          ), `profile-action-${i}`);
        })}
      </div>

      {/* Modals */}
      <ContactDoctorModal
        open={isContactModalOpen}
        onOpenChange={setIsContactModalOpen}
        doctor={doctor}
      />
      
      <DoctorReviewsModal
        open={isReviewsModalOpen}
        onOpenChange={setIsReviewsModalOpen}
        doctor={doctor}
      />

    </div>
  );
}
