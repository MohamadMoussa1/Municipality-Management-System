// Static role avatars - generic predefined avatars for each system role
export const rolePhotos: Record<string, string> = {
  admin: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin&backgroundColor=b6e3f4',
  clerk: 'https://api.dicebear.com/7.x/avataaars/svg?seed=clerk&backgroundColor=c0aede',
  finance: 'https://api.dicebear.com/7.x/avataaars/svg?seed=finance&backgroundColor=d1d4f9',
  hr_manager: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hrmanager&backgroundColor=ffd5dc',
  project_manager: 'https://api.dicebear.com/7.x/avataaars/svg?seed=projectmgr&backgroundColor=ffdfbf',
  citizen: 'https://api.dicebear.com/7.x/avataaars/svg?seed=citizen&backgroundColor=c1f4c5',
};

export const getRolePhoto = (role: string): string => {
  return rolePhotos[role] || rolePhotos.citizen;
};

export const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    admin: 'Admin',
    clerk: 'Clerk',
    finance: 'Finance Officer',
    hr_manager: 'HR Manager',
    project_manager: 'Project Manager',
    citizen: 'Citizen',
  };
  return roleNames[role] || role.replace('_', ' ');
};
