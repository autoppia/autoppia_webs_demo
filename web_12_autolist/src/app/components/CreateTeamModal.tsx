import { useState } from "react";
import { Modal, Form, Input, Select, Space } from "antd";
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

  const memberOptions = [
    { value: 'john@example.com', label: 'John Doe' },
    { value: 'jane@example.com', label: 'Jane Smith' },
    { value: 'bob@example.com', label: 'Bob Johnson' },
    { value: 'alice@example.com', label: 'Alice Williams' },
    { value: 'michael@example.com', label: 'Michael Brown' },
    { value: 'emily@example.com', label: 'Emily Davis' },
    { value: 'david@example.com', label: 'David Wilson' },
    { value: 'sophia@example.com', label: 'Sophia Martinez' },
    { value: 'lie@example.com', label: 'Lie Wei' },
    { value: 'fatima@example.com', label: 'Fatima Al-Farsi' },
    // Add more as needed
  ];

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();

      // Build members array with id, name, and role
      const members = (values.members || []).map((memberId: string) => {
        const option = memberOptions.find(opt => opt.value === memberId);
        const name = option ? option.label : memberId;
        const role = values.roles && values.roles[memberId] ? values.roles[memberId] : 'member';
        return {
          id: memberId,
          name,
          role
        };
      });

      logEvent(EVENT_TYPES.TEAM_CREATED, {
        timestamp: Date.now(),
        teamName: values.name,
        teamDescription: values.description,
        members,
      });
      
      onOk({ ...values, members });
      form.resetFields();

    } catch (error) {

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
      >
        <Space direction="vertical" size="large" className="w-full">

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
            <Input placeholder="Enter team name"/>
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
                  memberCount: values.length,
                  members: values
                });
              }}
              options={memberOptions}
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
                  { value: 'member', label: 'Member' },
                  { value: 'viewer', label: 'Viewer' },
                  { value: 'developer', label: 'Developer' },
                  { value: 'designer', label: 'Designer' },
                  { value: 'tester', label: 'Tester' },
                  { value: 'product_manager', label: 'Product Manager' },
                ]}
              />
            </Form.Item>
          ))}
        </Space>
      </Form>
    </Modal>
  );
}
