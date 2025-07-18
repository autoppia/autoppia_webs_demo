import Avatar from "@/components/Avatar";
import { mockUsers } from "@/library/mockData";

const currentUser = mockUsers[2];

export default function LeftSidebar() {
  return (
    <aside className="bg-white rounded-lg shadow p-5 mb-5 sticky top-20">
      <div className="flex flex-col items-center gap-2 mb-4">
        <Avatar src={currentUser.avatar} alt={currentUser.name} size={76} />
        <div className="font-bold text-lg mt-2">{currentUser.name}</div>
        <div className="text-gray-600 text-sm">{currentUser.title}</div>
      </div>

      <div className="w-full text-sm text-gray-600 border-t pt-2 mb-2">
        <div className="flex justify-between items-center py-1">
          <span>Profile viewers</span>
          <span className="text-blue-700 font-semibold cursor-pointer">
            500
          </span>
        </div>
        <div className="text-blue-700 font-semibold cursor-pointer mb-1 underline">
          View all analytics
        </div>
      </div>

      <div className="bg-gray-50 px-2 py-2 text-xs text-gray-500 rounded mb-2 border">
        Achieve 4x more profile visits
        <br />
        <span className="text-black font-medium">
          Get hired faster. Try Premium free.
        </span>
      </div>

      <div className="mt-3 text-gray-600 text-sm cursor-pointer hover:text-blue-600">
        <span>&#9734;</span> Saved items
      </div>
    </aside>
  );
}
