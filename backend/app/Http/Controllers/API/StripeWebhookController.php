<?php

namespace App\Http\Controllers\API;
use App\Models\Payment;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StripeWebhookController extends Controller
{
    public function handleStripeWebhook(Request $request){

    
        $payload = $request->getContent();
        $event = json_decode($payload, true);
        if ($event['type'] === 'checkout.session.completed') {
        $session = $event['data']['object'];
        $paymentId = $session['metadata']['payment_id'];
        $payment = Payment::find($paymentId);
        if ($payment) {
                        $payment->status = 'completed';
                        $payment->save();
                    }
                }
        return response()->json(['status' => 'success']);

    }
}
