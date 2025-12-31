"use client";

import { Modal, Form, Input, Space } from "antd";
import { useState } from "react";
import { useProjects } from "@/context/ProjectsContext";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { addProject } = useProjects();
  const dyn = useDynamicSystem();
  const modalId = dyn.v3.getVariant("sidebar-projects", ID_VARIANTS_MAP, "project-modal");
  const labelText = dyn.v3.getVariant("projects_heading", TEXT_VARIANTS_MAP, "Create new project");
  const inputPlaceholder = dyn.v3.getVariant("projects_heading", TEXT_VARIANTS_MAP, "e.g. Website redesign");
  const modalClass = dyn.v3.getVariant("card-surface", CLASS_VARIANTS_MAP, "");

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      addProject(values.name);
      form.resetFields();
      onClose();
    } catch (error) {
      // validation errors handled by antd
    } finally {
      setLoading(false);
    }
  };

  return dyn.v1.addWrapDecoy(
    "project-modal",
    <Modal
      title={labelText}
      open={open}
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText={dyn.v3.getVariant("save_task", TEXT_VARIANTS_MAP, "Create")}
      cancelText={dyn.v3.getVariant("cancel_action", TEXT_VARIANTS_MAP, "Cancel")}
      className={modalClass}
      rootClassName="project-modal"
    >
      {dyn.v1.addWrapDecoy(
        "project-modal-body",
        <Form form={form} layout="vertical" id={modalId}>
          <Space direction="vertical" size="middle" className="w-full">
            {dyn.v1.addWrapDecoy(
              "project-name-field",
              <Form.Item
                name="name"
                label={dyn.v3.getVariant("projects_heading", TEXT_VARIANTS_MAP, "Project name")}
                rules={[
                  { required: true, message: "Please enter a project name" },
                  { min: 3, message: "Must be at least 3 characters" },
                  { max: 50, message: "Must be 50 characters or less" },
                ]}
              >
                <Input
                  placeholder={inputPlaceholder}
                  id={dyn.v3.getVariant("task-form", ID_VARIANTS_MAP, "project-name-input")}
                />
              </Form.Item>
            )}
          </Space>
        </Form>
      )}
    </Modal>
  );
}
