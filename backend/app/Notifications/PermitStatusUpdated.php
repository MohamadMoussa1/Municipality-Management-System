<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PermitStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;
    public $permit;

    public function __construct($permit)
    {
        $this->permit = $permit;
    }

    // Channels: email + database
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    // Email format
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Permit Status Update')
            ->line("Your {$this->permit->type} permit #{$this->permit->id} status changed to: {$this->permit->status}.")
            ->line("Expiry date: {$this->permit->expiry_date}")
            ->line("Please log in to your account to view the updated permit.");
    }

    // Database format
    public function toArray($notifiable)
    {
       return [
            'id' => $this->permit->id,
            'status' => $this->permit->status,
            'type' => $this->permit->type,
            'message' => "Your {$this->permit->type} permit status is now: {$this->permit->status}. Expiry date: {$this->permit->expiry_date}",
            'created_at' => now()->toISOString(),
        ];
    }
}
