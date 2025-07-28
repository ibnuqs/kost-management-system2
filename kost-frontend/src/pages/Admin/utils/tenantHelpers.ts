// File: src/pages/Admin/utils/tenantHelpers.ts

/**
 * Extract tenant name from various possible data structures
 */
export const extractTenantName = (tenant: any): string | null => {
  if (!tenant) return null;
  
  // Try different field names that might contain the tenant name
  const possibleNames = [
    tenant.name,
    tenant.user_name,
    tenant.username,
    tenant.full_name,
    tenant.display_name,
    tenant.tenant_name,
    tenant.user?.name,
    tenant.user?.user_name,
    tenant.user?.full_name
  ];
  
  for (const name of possibleNames) {
    if (name && typeof name === 'string' && name.trim()) {
      return name.trim();
    }
  }
  
  return null;
};

/**
 * Extract tenant info with fallback values
 */
export const extractTenantInfo = (room: any) => {
  const tenant = room.tenant || room.tenants?.[0] || room.currentTenant || room.occupant || null;
  const tenantName = extractTenantName(tenant) || room.tenant_name || null;
  const tenantId = tenant?.id || tenant?.user_id || room.tenant_id || null;
  
  return {
    tenant,
    tenantName,
    tenantId,
    hasTenant: !!tenant || !!tenantName
  };
};

/**
 * Format tenant display name with fallback
 */
export const formatTenantDisplay = (room: any, fallback: string = 'Tidak ada penyewa'): string => {
  const { tenantName } = extractTenantInfo(room);
  return tenantName || fallback;
};