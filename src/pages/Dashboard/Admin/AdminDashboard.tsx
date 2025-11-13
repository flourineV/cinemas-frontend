import React from "react";
import Layout from "../../../components/layout/Layout";

// import 3 component bạn đã yêu cầu
import OverviewCards from "@/components/admin/OverviewUserCards";
import UserRegistrationChart from "@/components/admin/UserRegistrationChart";
import UserManagementTable from "@/components/admin/UserManagementTable";

const AdminDashboard: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen py-20 pt-32">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Dashboard Quản Trị Viên
          </h1>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Tổng quan hệ thống
            </h2>

            {/* Bỏ grid để OverviewCards tự fill 100% */}
            <OverviewCards />
          </div>

          <div className="mt-20">
            <UserRegistrationChart />
          </div>

          <UserManagementTable />
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
