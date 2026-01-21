<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentCreated extends Notification
{
    use Queueable;
    public $payment;

    /**
     * Create a new notification instance.
     */
    public function __construct($payment)
    {
        $this->payment=$payment;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
       return (new MailMessage)
            ->subject('New Payment Created')
            ->line("A new payment was created for you.")
            ->line("Amount: {$this->payment->amount}")
            ->line("Type: {$this->payment->payment_type}")
            ->line("Status: {$this->payment->status}");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'id' => $this->payment->id,
            'amount' => $this->payment->amount,
            'message' => "A new payment was created for you.",
            'type' => $this->payment->payment_type,
            'status' => $this->payment->status,
            'created_at' => now()->toISOString(),
        ];
    }
}
