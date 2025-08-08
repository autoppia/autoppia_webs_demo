import { UserOutlined, DownOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import { useState } from "react";

export default function Navbar() {
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);

  const profilePanel = (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-w-[200px] py-2 px-0 mt-2">
      <button
        className="flex items-center w-full px-4 py-2 text-[15px] hover:bg-gray-50 cursor-pointer"
        onClick={() => {
          setProfilePopoverOpen(false);
          // Add profile page navigation logic here
        }}
      >
        <span className="flex-1 text-gray-900 text-left">Profile</span>
      </button>
      <button
        className="flex items-center w-full px-4 py-2 text-[15px] hover:bg-gray-50 cursor-pointer"
        onClick={() => {
          setProfilePopoverOpen(false);
          // Add settings page navigation logic here
        }}
      >
        <span className="flex-1 text-gray-900 text-left">Settings</span>
      </button>
      <button
        className="flex items-center w-full px-4 py-2 text-[15px] hover:bg-gray-50 cursor-pointer"
        onClick={() => {
          setProfilePopoverOpen(false);
          // Add logout logic here
        }}
      >
        <span className="flex-1 text-gray-900 text-left">Logout</span>
      </button>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                className="border-b-2 border-transparent px-1 pt-1 pb-4 text-md font-medium text-gray-600 hover:text-gray-900 hover:border-[#d1453b]"
                onClick={() => {
                  // Add navigation to inbox
                }}
              >
                Upcoming
              </button>
              <button
                className="border-b-2 border-transparent px-1 pt-1 pb-4 text-md font-medium text-gray-600 hover:text-gray-900 hover:border-[#d1453b]"
                onClick={() => {
                  // Add navigation to today
                }}
              >
                Drafts
              </button>
              <button
                className="border-b-2 border-transparent px-1 pt-1 pb-4 text-md font-medium text-gray-600 hover:text-gray-900 hover:border-[#d1453b]"
                onClick={() => {
                  // Add navigation to completed
                }}
              >
                More
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <Popover
              placement="bottomRight"
              trigger="click"
              open={profilePopoverOpen}
              onOpenChange={setProfilePopoverOpen}
              content={profilePanel}
              overlayClassName="!p-0"
            >
              <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-50 transition px-3 py-2 rounded-md text-md font-medium">
                <img
                  alt="avatar"
                  src="https://randomuser.me/api/portraits/men/1.jpg"
                  className="rounded-full w-8 h-8"
                />
                <span>John Wick</span>
                <DownOutlined style={{ fontSize: 11 }} />
              </button>
            </Popover>
          </div>
        </div>
      </div>
    </nav>
  );
}
