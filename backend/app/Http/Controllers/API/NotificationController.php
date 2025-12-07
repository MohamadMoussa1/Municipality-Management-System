<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
     /**
     * Get all notifications (read + unread)
     */
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'notifications' => auth()->user()->notifications,
        ]);
    }
     /**
     * Get unread notifications only
     */
    public function unread()
    {
        return response()->json([
            'status' => 'success',
            'notifications' => auth()->user()->unreadNotifications,
        ]);
    }
    /**
     * Mark a specific notification as read
     */
    public function markAsRead($id)
    {
        $notification = auth()->user()->notifications()->find($id);

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark ALL notifications as read
     */
    public function markAllAsRead()
    {
        auth()->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Delete a notification
     */
    public function destroy($id)
    {
        $notification = auth()->user()->notifications()->find($id);

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification deleted successfully']);
    }
}
