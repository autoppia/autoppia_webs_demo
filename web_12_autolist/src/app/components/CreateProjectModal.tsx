"use client";

import { Modal, Form, Input, Space } from "antd";
import { useState } from "react";
import { useProjects } from "@/context/ProjectsContext";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { addProject } = useProjects();

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

  return (
    <Modal
      title="Create new project"
      open={open}
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText="Create"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Space direction="vertical" size="middle" className="w-full">
          <Form.Item
            name="name"
            label="Project name"
            rules={[
              { required: true, message: "Please enter a project name" },
              { min: 3, message: "Must be at least 3 characters" },
              { max: 50, message: "Must be 50 characters or less" },
            ]}
          >
            <Input placeholder="e.g. Website redesign" />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
}
