<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CitizenRequestStatusUpdated extends Notification
{
    use Queueable;

    public $citizenRequest;

    /**
     * Create a new notification instance.
     */
    public function __construct($citizenRequest)
    {
        $this->citizenRequest = $citizenRequest;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Request Status Update')
            ->line("Your {$this->citizenRequest->type} request #{$this->citizenRequest->id} status has been updated to: {$this->citizenRequest->status}.")
            ->line("Submission date: {$this->citizenRequest->submission_date}")
            ->line("Completion date: " . ($this->citizenRequest->completion_date ? $this->citizenRequest->completion_date : 'Not completed yet'))
            ->line("Please log in to your account to view the updated request details.");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array
     */
    public function toArray($notifiable)
    {
      return [
            'id' => $this->citizenRequest->id,
            'status' => $this->citizenRequest->status,
            'message' => "Your {$this->citizenRequest->type} request status is now: {$this->citizenRequest->status}. Submitted on: {$this->citizenRequest->submission_date}",
            'created_at' => now()->toISOString(),
            'type' => $this->citizenRequest->type,
            'completion_date' => $this->citizenRequest->completion_date ? $this->citizenRequest->completion_date->toISOString() : null,
        ];
    }
}
