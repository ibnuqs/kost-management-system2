// // File: src/services/rfidService.ts - Updated with correct endpoints
// import api, { endpoints } from '../utils/api';
// import { RfidCard, AccessLog, User, Room } from '../types';

// export interface RfidCardData {
//   rfid_uid: string;
//   user_id: number;
//   room_id: number;
//   status?: 'active' | 'inactive';
// }

// export interface ScanCommandData {
//   device_id: string;
//   mode: 'scan' | 'register' | 'check';
//   timeout?: number;
// }

// class RfidService {
//   // Get all RFID cards
//   async getRfidCards(params?: {
//     search?: string;
//     status?: 'active' | 'inactive';
//     user_id?: number;
//     room_id?: number;
//     limit?: number;
//     page?: number;
//   }): Promise<RfidCard[]> {
//     try {
//       const response = await api.get(endpoints.rfid.adminIndex, { params });
//       return response.data?.data || response.data;
//     } catch (error) {
//       console.error('Failed to fetch RFID cards:', error);
//       throw error;
//     }
//   }

//   // Register new RFID card
//   async registerCard(data: RfidCardData): Promise<RfidCard> {
//     try {
//       const response = await api.post(endpoints.rfid.register, data);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to register RFID card:', error);
//       throw error;
//     }
//   }

//   // Delete RFID card
//   async deleteCard(id: number): Promise<void> {
//     try {
//       await api.delete(endpoints.rfid.delete(id));
//     } catch (error) {
//       console.error('Failed to delete RFID card:', error);
//       throw error;
//     }
//   }

//   // Toggle card status (active/inactive)
//   async toggleCardStatus(id: number): Promise<RfidCard> {
//     try {
//       const response = await api.patch(endpoints.rfid.toggle(id));
//       return response.data;
//     } catch (error) {
//       console.error('Failed to toggle card status:', error);
//       throw error;
//     }
//   }

//   // Check if RFID card exists
//   async checkCard(rfid_uid: string): Promise<{
//     exists: boolean;
//     card?: RfidCard;
//     message: string;
//   }> {
//     try {
//       const response = await api.post(endpoints.rfid.checkAccess, { rfid_uid });
//       return response.data;
//     } catch (error) {
//       console.error('Failed to check RFID card:', error);
//       throw error;
//     }
//   }

//   // Start scanning mode on ESP32 device
//   async startScan(data: ScanCommandData): Promise<{
//     success: boolean;
//     message: string;
//     session_id?: string;
//   }> {
//     try {
//       const response = await api.post(endpoints.rfid.registerScan, data);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to start scan:', error);
//       throw error;
//     }
//   }

//   // Get access logs
//   async getAccessLogs(params?: {
//     search?: string;
//     user_id?: number;
//     room_id?: number;
//     device_id?: string;
//     access_granted?: boolean;
//     date_from?: string;
//     date_to?: string;
//     limit?: number;
//     page?: number;
//   }): Promise<AccessLog[]> {
//     try {
//       const response = await api.get(endpoints.accessLogs.adminIndex, { params });
//       return response.data?.data || response.data;
//     } catch (error) {
//       console.error('Failed to fetch access logs:', error);
//       throw error;
//     }
//   }

//   // Get users for card registration (tenants)
//   async getUsersForRegistration(): Promise<User[]> {
//     try {
//       const response = await api.get(endpoints.tenants.index, {
//         params: { 
//           status: 'active',
//           without_rfid: true // Only users without RFID cards
//         }
//       });
//       return response.data?.data || response.data;
//     } catch (error) {
//       console.error('Failed to fetch users for registration:', error);
//       throw error;
//     }
//   }

//   // Get rooms for card registration
//   async getRoomsForRegistration(): Promise<Room[]> {
//     try {
//       const response = await api.get(endpoints.rooms.index, {
//         params: { 
//           status: 'available,occupied'
//         }
//       });
//       return response.data?.data || response.data;
//     } catch (error) {
//       console.error('Failed to fetch rooms for registration:', error);
//       throw error;
//     }
//   }

//   // Export access logs
//   async exportAccessLogs(params?: {
//     date_from?: string;
//     date_to?: string;
//     format?: 'csv' | 'excel' | 'pdf';
//   }): Promise<Blob> {
//     try {
//       const response = await api.get(endpoints.accessLogs.export, {
//         params,
//         responseType: 'blob'
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Failed to export access logs:', error);
//       throw error;
//     }
//   }

//   // Statistics and analytics
//   async getRfidStats(): Promise<{
//     total_cards: number;
//     active_cards: number;
//     inactive_cards: number;
//     today_access: number;
//     today_denied: number;
//     weekly_access: Array<{ date: string; count: number }>;
//     top_users: Array<{ user_name: string; access_count: number }>;
//     device_uptime: number;
//   }> {
//     try {
//       const response = await api.get(`${endpoints.rfid.adminIndex}/stats`);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch RFID stats:', error);
//       throw error;
//     }
//   }
// }

// // Create singleton instance
// const rfidService = new RfidService();

// export default rfidService;