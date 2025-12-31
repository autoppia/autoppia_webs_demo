"use client";

import { useState } from "react";
import { Modal, Form, Input, Select, Space } from "antd";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

interface TeamMember {
  id: string;
  name: string;
  role: string;
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
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);
  const dyn = useDynamicSystem();
  const modalClass = dyn.v3.getVariant("card-surface", CLASS_VARIANTS_MAP, "");
  const titleText = dyn.v3.getVariant("teams_heading", TEXT_VARIANTS_MAP, "Create New Team");
  const modalId = dyn.v3.getVariant("sidebar-teams", ID_VARIANTS_MAP, "team-modal");

  const memberOptions = [
    { value: "john@example.com", label: "John Doe" },
    { value: "jane@example.com", label: "Jane Smith" },
    { value: "bob@example.com", label: "Bob Johnson" },
    { value: "alice@example.com", label: "Alice Williams" },
    { value: "michael@example.com", label: "Michael Brown" },
    { value: "emily@example.com", label: "Emily Davis" },
    { value: "david@example.com", label: "David Wilson" },
    { value: "sophia@example.com", label: "Sophia Martinez" },
    { value: "lie@example.com", label: "Lie Wei" },
    { value: "fatima@example.com", label: "Fatima Al-Farsi" },
  ];

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "member", label: "Member" },
    { value: "viewer", label: "Viewer" },
    { value: "developer", label: "Developer" },
    { value: "designer", label: "Designer" },
    { value: "tester", label: "Tester" },
    { value: "product_manager", label: "Product Manager" },
  ];

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();

      const members = (values.members || []).map((memberId: string) => {
        const option = memberOptions.find((opt) => opt.value === memberId);
        const name = option ? option.label : memberId;
        const roleValue = values.roles && values.roles[memberId] ? values.roles[memberId] : "member";
        const roleObj = roleOptions.find((opt) => opt.value === roleValue || opt.label === roleValue);
        const role = roleObj ? roleObj.label : roleValue;
        return {
          id: memberId,
          name,
          role,
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

  return dyn.v1.addWrapDecoy(
    "team-modal",
    <Modal
      title={titleText}
      open={open}
      onCancel={() => {
        form.resetFields();
        setSelectedMembers([]);
        onCancel();
      }}
      onOk={handleSubmit}
      okText={dyn.v3.getVariant("save-team-button", TEXT_VARIANTS_MAP, "Save Team")}
      cancelText={dyn.v3.getVariant("cancel_action", TEXT_VARIANTS_MAP, "Cancel")}
      className={modalClass}
      okButtonProps={{ id: dyn.v3.getVariant("create-team-button", ID_VARIANTS_MAP, "create-team-button"), loading }}
      cancelButtonProps={{ id: dyn.v3.getVariant("cancel-team-button", ID_VARIANTS_MAP, "cancel-team-button") }}
    >
      {dyn.v1.addWrapDecoy(
        "team-modal-body",
        <Form form={form} layout="vertical" className="mt-4" id={modalId}>
          <Space direction="vertical" size="large" className="w-full">
            {dyn.v1.addWrapDecoy(
              "team-name",
              <Form.Item
                name="name"
                label={dyn.v3.getVariant("team-name-label", TEXT_VARIANTS_MAP, "Team Name")}
                rules={[
                  { required: true, message: "Please enter a team name" },
                  { min: 3, message: "Team name must be at least 3 characters" },
                  { max: 50, message: "Team name cannot exceed 50 characters" },
                ]}
                validateTrigger="onBlur"
              >
                <Input
                  placeholder={dyn.v3.getVariant("enter-team-name-placeholder", TEXT_VARIANTS_MAP, "Enter team name")}
                  id={dyn.v3.getVariant("team-name-input", ID_VARIANTS_MAP, "team-name-input")}
                />
              </Form.Item>
            )}

            {dyn.v1.addWrapDecoy(
              "team-description",
              <Form.Item
                name="description"
                label={dyn.v3.getVariant("team-description-label", TEXT_VARIANTS_MAP, "Description")}
                rules={[
                  { required: true, message: "Please enter a team description" },
                  { max: 500, message: "Description cannot exceed 500 characters" },
                ]}
                validateTrigger="onBlur"
              >
                <Input.TextArea
                  placeholder={dyn.v3.getVariant("input-description-placeholder", TEXT_VARIANTS_MAP, "Enter team description")}
                  rows={4}
                  id={dyn.v3.getVariant("team-description-input", ID_VARIANTS_MAP, "team-description-input")}
                />
              </Form.Item>
            )}

            {dyn.v1.addWrapDecoy(
              "team-members",
              <Form.Item
                name="members"
                label={dyn.v3.getVariant("team-members-label", TEXT_VARIANTS_MAP, "Team Members")}
                rules={[{ required: true, message: "Please add at least one team member" }]}
              >
                <Select
                  mode="multiple"
                  placeholder={dyn.v3.getVariant("select-team-members-placeholder", TEXT_VARIANTS_MAP, "Select team members")}
                  style={{ width: "100%" }}
                  onChange={(values: string[]) => {
                    const memberNames = values.map((v) => memberOptions.find((opt) => opt.value === v)?.label || v);
                    setSelectedMembers(
                      values.map((v) => ({
                        id: v,
                        name: memberOptions.find((opt) => opt.value === v)?.label || v,
                        role: "member",
                      }))
                    );
                    logEvent(EVENT_TYPES.TEAM_MEMBERS_ADDED, {
                      timestamp: Date.now(),
                      memberCount: values.length,
                      members: memberNames,
                    });
                  }}
                  options={memberOptions}
                />
              </Form.Item>
            )}

            {selectedMembers.map((member) =>
              dyn.v1.addWrapDecoy(
                `team-member-role-${member.id}`,
                <Form.Item key={member.id} label={`Role for ${member.name}`} name={["roles", member.id]} initialValue="member">
                  <Select
                    options={roleOptions}
                    onChange={(value) => {
                      const option = roleOptions.find((opt) => opt.value === value);
                      const label = option ? option.label : value;
                      form.setFieldValue(["roles", member.id], label);
                      logEvent(EVENT_TYPES.TEAM_ROLE_ASSIGNED, {
                        timestamp: Date.now(),
                        memberId: member.name,
                        role: label,
                      });
                    }}
                  />
                </Form.Item>
              )
            )}
          </Space>
        </Form>
      )}
    </Modal>
  );
}
