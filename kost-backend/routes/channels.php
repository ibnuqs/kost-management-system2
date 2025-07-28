<?php
// File: routes/channels.php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log; // 👈 TAMBAH IMPORT LOG FACADE
use App\Models\User;

// Admin channels - hanya admin yang bisa listen
Broadcast::channel('admin-notifications', function (User $user) {
    Log::info('Admin channel auth check', ['user' => $user->email, 'role' => $user->role]); // 👈 SEKARANG BENAR
    return $user->role === 'admin' ? $user : null;
});

// User-specific private channels
Broadcast::channel('user.{id}', function (User $user, $id) {
    Log::info('User channel auth check', ['user' => $user->id, 'requested_id' => $id]); // 👈 SEKARANG BENAR
    return (int) $user->id === (int) $id ? $user : null;
});

// Room-specific channels (tenant bisa listen room mereka)
Broadcast::channel('room.{roomId}', function (User $user, $roomId) {
    if ($user->role === 'admin') {
        return $user;
    }
    
    // Cek apakah user adalah tenant dari room ini
    $isActiveTenant = $user->tenants()
        ->where('room_id', $roomId)
        ->where('status', 'active')
        ->exists();
    
    Log::info('Room channel auth check', [ // 👈 SEKARANG BENAR
        'user' => $user->email, 
        'room_id' => $roomId, 
        'is_active_tenant' => $isActiveTenant
    ]);
        
    return $isActiveTenant ? $user : null;
});

// System-wide public channel (semua authenticated user)
Broadcast::channel('system-announcements', function (User $user) {
    return $user;
});