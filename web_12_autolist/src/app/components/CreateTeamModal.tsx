import { useState } from "react";
import { Modal, Form, Input, Upload, Select, Space, Avatar } from "antd";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { logEvent, EVENT_TYPES } from "@/library/events";

interface TeamMember {
  id: string;
  name: string;
  role: 'admin' | 'member';
}

interface TeamFormValues {
  name: string;
  description: string;
  avatar?: File;
  members: TeamMember[];
}

interface CreateTeamModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: TeamFormValues) => void;
}

export default function CreateTeamModal({ open, onCancel, onOk }: CreateTeamModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);

  interface FieldData {
    name: (string | number)[];
    value?: string | string[] | File | undefined;
    touched?: boolean;
    validating?: boolean;
    errors?: string[];
  }

  const handleFieldChange = (changedFields: FieldData[], allFields: FieldData[]) => {
    logEvent(EVENT_TYPES.FORM_FIELD_CHANGED, {
      timestamp: Date.now(),
      form: "createTeam",
      field: changedFields[0]?.name[0],
      value: changedFields[0]?.value
    });
  };

  const handleFieldFocus = (field: string) => {
    logEvent(EVENT_TYPES.FORM_FIELD_FOCUSED, {
      timestamp: Date.now(),
      form: "createTeam",
      field
    });
  };

  const handleFieldBlur = (field: string) => {
    logEvent(EVENT_TYPES.FORM_FIELD_BLURRED, {
      timestamp: Date.now(),
      form: "createTeam",
      field
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      logEvent(EVENT_TYPES.FORM_SUBMISSION_STARTED, {
        timestamp: Date.now(),
        form: "createTeam"
      });
      
      const values = await form.validateFields();
      
      logEvent(EVENT_TYPES.FORM_SUBMISSION_SUCCESS, {
        timestamp: Date.now(),
        form: "createTeam"
      });
      
      logEvent(EVENT_TYPES.TEAM_CREATED, {
        timestamp: Date.now(),
        teamName: values.name,
      });
      
      onOk(values);
      form.resetFields();
      
      logEvent(EVENT_TYPES.FORM_CLEARED, {
        timestamp: Date.now(),
        form: "createTeam"
      });
    } catch (error) {
      logEvent(EVENT_TYPES.FORM_VALIDATION_ERROR, {
        timestamp: Date.now(),
        form: "createTeam",
        error: error instanceof Error ? error.message : "Unknown error"
      });
      console.error("Form validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create New Team"
      open={open}
      onCancel={() => {
        form.resetFields();
        setAvatarUrl(undefined);
        setSelectedMembers([]);
        onCancel();
      }}
      onOk={handleSubmit}
      okButtonProps={{ loading }}
      okText="Create Team"
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        onFieldsChange={handleFieldChange}
      >
        <Space direction="vertical" size="large" className="w-full">
          {/* Team Avatar Upload */}
          <Form.Item 
            name="avatar"
            className="flex justify-center"
          >
            <Upload
              name="avatar"
              listType="picture-circle"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  console.error('You can only upload image files!');
                  return false;
                }
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                  setAvatarUrl(reader.result as string);
                  logEvent(EVENT_TYPES.TEAM_AVATAR_UPLOADED, {
                    timestamp: Date.now(),
                    fileName: file.name,
                    fileSize: file.size
                  });
                };
                return false;
              }}
            >
              {avatarUrl ? (
                <Avatar 
                  src={avatarUrl} 
                  size={80}
                  alt="team avatar" 
                />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          {/* Team Name */}
          <Form.Item
            name="name"
            label="Team Name"
            rules={[
              { required: true, message: "Please enter a team name" },
              { min: 3, message: "Team name must be at least 3 characters" },
              { max: 50, message: "Team name cannot exceed 50 characters" }
            ]}
            validateTrigger="onBlur"
          >
            <Input 
              placeholder="Enter team name"
              onFocus={() => handleFieldFocus("name")}
              onBlur={(e) => {
                handleFieldBlur("name");
                if (e.target.value.length >= 3 && e.target.value.length <= 50) {
                  logEvent(EVENT_TYPES.TEAM_NAME_VALIDATED, {
                    timestamp: Date.now(),
                    name: e.target.value
                  });
                }
              }}
            />
          </Form.Item>

          {/* Team Description */}
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter a team description" },
              { max: 500, message: "Description cannot exceed 500 characters" }
            ]}
            validateTrigger="onBlur"
          >
            <Input.TextArea 
              placeholder="Enter team description"
              rows={4}
              onFocus={() => handleFieldFocus("description")}
              onBlur={(e) => {
                handleFieldBlur("description");
                if (e.target.value) {
                  logEvent(EVENT_TYPES.TEAM_DESCRIPTION_VALIDATED, {
                    timestamp: Date.now(),
                    descriptionLength: e.target.value.length
                  });
                }
              }}
            />
          </Form.Item>

          {/* Team Members */}
          <Form.Item
            name="members"
            label="Team Members"
            rules={[{ required: true, message: "Please add at least one team member" }]}
          >
            <Select
              mode="multiple"
              placeholder="Select team members"
              style={{ width: '100%' }}
              onChange={(values: string[]) => {
                setSelectedMembers(values.map(v => ({
                  id: v,
                  name: v,
                  role: 'member' as const
                })));
                logEvent(EVENT_TYPES.TEAM_MEMBERS_ADDED, {
                  timestamp: Date.now(),
                  memberCount: values.length
                });
              }}
              options={[
                { value: 'john@example.com', label: 'John Doe' },
                { value: 'jane@example.com', label: 'Jane Smith' },
                { value: 'bob@example.com', label: 'Bob Johnson' },
              ]}
            />
          </Form.Item>

          {/* Member Roles */}
          {selectedMembers.map((member) => (
            <Form.Item
              key={member.id}
              label={`Role for ${member.name}`}
              name={['roles', member.id]}
              initialValue="member"
            >
              <Select
                onChange={(value) => {
                  logEvent(EVENT_TYPES.TEAM_ROLE_ASSIGNED, {
                    timestamp: Date.now(),
                    memberId: member.id,
                    role: value
                  });
                }}
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'member', label: 'Member' }
                ]}
              />
            </Form.Item>
          ))}
        </Space>
      </Form>
    </Modal>
  );
}
