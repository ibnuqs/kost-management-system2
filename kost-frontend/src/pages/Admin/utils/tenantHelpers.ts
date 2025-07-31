// File: src/pages/Admin/utils/tenantHelpers.ts

interface TenantLike {
  name?: string;
  user_name?: string;
  username?: string;
  full_name?: string;
  display_name?: string;
  tenant_name?: string;
  user?: {
    name?: string;
    user_name?: string;
    full_name?: string;
  };
}

/**
 * Extract tenant name from various possible data structures
 */
export const extractTenantName = (tenant: unknown): string | null => {
  if (!tenant) return null;
  
  const tenantData = tenant as TenantLike;
  
  // Try different field names that might contain the tenant name
  const possibleNames = [
    tenantData.name,
    tenantData.user_name,
    tenantData.username,
    tenantData.full_name,
    tenantData.display_name,
    tenantData.tenant_name,
    tenantData.user?.name,
    tenantData.user?.user_name,
    tenantData.user?.full_name
  ];
  
  for (const name of possibleNames) {
    if (name && typeof name === 'string' && name.trim()) {
      return name.trim();
    }
  }
  
  return null;
};

interface RoomLike {
  tenant?: TenantLike;
  tenants?: TenantLike[];
  currentTenant?: TenantLike;
  occupant?: TenantLike;
  tenant_name?: string;
  tenant_id?: number | string;
}

interface TenantWithId extends TenantLike {
  id?: number | string;
  user_id?: number | string;
}

/**
 * Extract tenant info with fallback values
 */
export const extractTenantInfo = (room: unknown) => {
  const roomData = room as RoomLike;
  const tenant = roomData.tenant || roomData.tenants?.[0] || roomData.currentTenant || roomData.occupant || null;
  const tenantName = extractTenantName(tenant) || roomData.tenant_name || null;
  const tenantId = (tenant as TenantWithId)?.id || (tenant as TenantWithId)?.user_id || roomData.tenant_id || null;
  
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
export const formatTenantDisplay = (room: unknown, fallback: string = 'Tidak ada penyewa'): string => {
  const { tenantName } = extractTenantInfo(room);
  return tenantName || fallback;
};