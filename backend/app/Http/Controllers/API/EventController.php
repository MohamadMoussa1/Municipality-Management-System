<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EventController extends Controller
{
    /**
     * Display a listing of the events.
     * - Admin: Views all events
     * - Employee: Views public and staff-targeted events
     * - Citizen: Views public and citizen-targeted events
     */
    public function index()
    {
        $user = Auth::user();
        
        $query = Event::query();
        
        if ($user->hasRole('admin')) {
            // Admin can see all events
            $events = $query->latest()->get();
        } elseif ($user->hasRole('citizen')) {
        // Citizen and other roles can see public and citizen events
            $events = $query->whereIn('target_audience', ['public', 'citizens'])
                          ->latest()
                          ->get();
        } else {
            // Employee can see public and staff events
            $events = $query->whereIn('target_audience', ['public', 'staff'])
                          ->latest()
                          ->get();
        }
        
        return response()->json($events);
    }

    /**
     * Store a newly created event in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date|after_or_equal:today',
            'target_audience' => 'required|in:public,staff,citizens',
        ]);

        $event = Event::create($validated);

        return response()->json([
            'message' => 'Event created successfully',
            'event' => $event
        ], 201);
    }

    /**
     * Display the specified event.
     */
    /**
 * Display the specified event.
 */
    public function show(Event $event)
    {
        $user = Auth::user();
        
        if ($user->hasRole('admin')) {
            // Admin can see any event
            return response()->json($event);
        } elseif ($user->hasRole('citizen')) {
            // Citizen can only see public or citizen-targeted events
            if (in_array($event->target_audience, ['public', 'citizens'])) {
                return response()->json($event);
            }
        } else {
            // Employee can only see public or staff-targeted events
            if (in_array($event->target_audience, ['public', 'staff'])) {
                return response()->json($event);
            }
        }
        
        // If none of the above conditions are met, return 403 Forbidden
        return response()->json([
            'message' => 'Unauthorized to view this event'
        ], 403);
    }

    /**
     * Update the specified event in storage.
     */
    public function update(Request $request, Event $event)
    {
        // Check if the user is an admin
        if (!Auth::user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. Only administrators can update events.'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'date' => 'sometimes|required|date|after_or_equal:today',
            'target_audience' => 'sometimes|required|in:public,staff,citizens',
        ]);

        $event->update($validated);

        return response()->json([
            'message' => 'Event updated successfully',
            'event' => $event
        ]);
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy(Event $event)
    {
        // Check if the user is an admin
        if (!Auth::user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. Only administrators can delete events.'
            ], 403);
        }

        $event->delete();

        return response()->json([
            'message' => 'Event deleted successfully'
        ], 200);
    }
}
