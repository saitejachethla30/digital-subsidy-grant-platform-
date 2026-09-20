export const roleConfig = {
  ADMIN: {
    label: 'Administrator',
    homePath: '/admin',
  },
  BENEFICIARY: {
    label: 'Beneficiary',
    homePath: '/beneficiary',
  },
  FIELD_OFFICER: {
    label: 'Field Officer',
    homePath: '/field-officer',
  },
  DISTRICT_OFFICER: {
    label: 'District Officer',
    homePath: '/district-officer',
  },
  FINANCE_OFFICER: {
    label: 'Finance Officer',
    homePath: '/finance-officer',
  },
};

export function getRoleConfig(role) {
  return roleConfig[role] || null;
}

export function getNavigationItems(role) {
  const config = getRoleConfig(role);

  if (!config) {
    return [];
  }

  return [
    {
      label: 'Dashboard',
      path: config.homePath,
      icon: '▦',
    },
    {
      label: 'Schemes',
      path: `${config.homePath}/schemes`,
      icon: '▤',
    },
    {
      label: 'Applications',
      path: `${config.homePath}/applications`,
      icon: '▥',
    },
    ...(role === 'ADMIN' || role === 'FIELD_OFFICER' || role === 'DISTRICT_OFFICER' ? [{ label: 'Beneficiaries', path: `${config.homePath}/beneficiaries`, icon: 'B' }] : []),
    ...(role === 'ADMIN' ? [{ label: 'User Management', path: `${config.homePath}/users`, icon: 'U' }] : []),
    ...(role === 'ADMIN' ? [{ label: 'Role Management', path: `${config.homePath}/roles`, icon: 'R' }] : []),
    ...(['ADMIN', 'FIELD_OFFICER', 'DISTRICT_OFFICER', 'FINANCE_OFFICER'].includes(role) ? [{ label: 'Master Data', path: `${config.homePath}/master-data`, icon: 'M' }] : []),
    ...(role === 'ADMIN' || role === 'FIELD_OFFICER' || role === 'DISTRICT_OFFICER' ? [{ label: 'Verification', path: `${config.homePath}/verifications`, icon: '✓' }] : []),
    ...(role === 'ADMIN' || role === 'DISTRICT_OFFICER' ? [{ label: 'Approval', path: `${config.homePath}/approvals`, icon: 'A' }] : []),
    ...(role === 'ADMIN' || role === 'FINANCE_OFFICER' ? [{ label: 'Disbursement', path: `${config.homePath}/disbursements`, icon: '₹' }] : []),
  ];
}
