import React from 'react';

interface AdminPanelWrapperProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const AdminPanelWrapper: React.FC<AdminPanelWrapperProps> = ({ title, children, action }) => {
  return (
    <div className="bg-white border-2 border-black rounded-3xl p-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black">{title}</h1>
          <p className="text-black/60 text-sm mt-2 uppercase tracking-wide">Manage and configure your settings</p>
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
};

export default AdminPanelWrapper;
