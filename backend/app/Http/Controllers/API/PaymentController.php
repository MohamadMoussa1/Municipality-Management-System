<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\Payment\IndexPaymentsRequest;
use App\Http\Resources\PaymentsResource\PaymentResource;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log;
use App\Notifications\PaymentCreated;



class PaymentController extends Controller
{   
    /**
     * Get the sum of all pending payment amounts
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPendingPaymentsSum(Request $request)
    {
        $user = $request->user();
        $query = \App\Models\Payment::where('status', 'pending');

        // If user is a citizen, only show their pending payments
        if ($user->role === 'citizen') {
            if (!$user->citizen) {
                return response()->json([
                    'message' => 'Citizen profile not found.'
                ], 400);
            }
            $query->where('citizen_id', $user->citizen->id);
        } 
        // Only allow admin, clerk, and citizen roles
        elseif (!in_array($user->role, ['admin', 'finance_officer'])) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $totalPending = $query->sum('amount');
        $pendingCount = $query->count();

        return response()->json([
            'total_pending_amount' => (float) $totalPending,
            'currency' => 'USD',
            'pending_payments_count' => $pendingCount
        ], 200);
    }

    //get sumation of all payments
    /**
 * Get payment summary including totals by status and type
 *
 * @param  \Illuminate\Http\Request  $request
 * @return \Illuminate\Http\JsonResponse
 */
public function getPaymentSummary(Request $request)
{
    $user = $request->user();
    $baseQuery = \App\Models\Payment::query();

    // If user is a citizen, only show their payments
    if ($user->role === 'citizen') {
        if (!$user->citizen) {
            return response()->json([
                'message' => 'Citizen profile not found.'
            ], 400);
        }
        $baseQuery->where('citizen_id', $user->citizen->id);
    } 
    // Only allow admin, finance_officer, and citizen roles
    elseif (!in_array($user->role, ['admin', 'finance_officer'])) {
        return response()->json([
            'message' => 'Unauthorized.'
        ], 403);
    }

    // Get all possible payment types
    $paymentTypes = ['property_tax', 'water_bill', 'electricity_bill', 'waste_management', 'other'];
    
    // Initialize default values for all payment types
    $totalsByType = collect($paymentTypes)->mapWithKeys(function($type) {
        return [$type => ['total_amount' => 0, 'count' => 0]];
    });

    // Get and merge actual data for completed payments
    $completedPayments = (clone $baseQuery)
        ->where('status', 'completed')
        ->selectRaw('payment_type, COALESCE(SUM(amount), 0) as total_amount, COUNT(*) as count')
        ->groupBy('payment_type')
        ->get()
        ->keyBy('payment_type')
        ->toArray();

    // Merge actual data with default values
    foreach ($completedPayments as $type => $data) {
        $totalsByType[$type] = [
            'total_amount' => (float) $data['total_amount'],
            'count' => (int) $data['count']
        ];
    }

    return response()->json([
        'total_amount' => (float) ($baseQuery->sum('amount') ?? 0),
        'total_completed' => (float) ((clone $baseQuery)->where('status', 'completed')->sum('amount') ?? 0),
        'total_pending' => (float) ((clone $baseQuery)->where('status', 'pending')->sum('amount') ?? 0),
        'total_failed' => (float) ((clone $baseQuery)->where('status', 'failed')->sum('amount') ?? 0),
        'by_type' => $totalsByType,
        'currency' => 'USD'
    ], 200);
}


    public function store(StorePaymentRequest $request):JsonResponse
    {
       $user = $request->user();

        // Authorization rules
        $allowed = $user->role === 'admin'
            || ($user->role === 'finance_officer'
                && optional($user->employee)->department === 'finance');

        if (!$allowed) {
            return response()->json([
                'message' => 'Only finance officers in finance department or admins can create payments.'
            ], 403);
        }
    
        
        $validated = $request->validated();
        


        try {
            $payment = Payment::create([
                'citizen_id'   => $validated['citizen_id'],
                'amount'       => $validated['amount'],
                'payment_type' => $validated['payment_type'],
                'date'         => now(),
                'status'       => $validated['status'] ?? 'pending',
            ]);
            // Notify the citizen about the new payment
            
            $payment->citizen->user->notify(
                (new \App\Notifications\PaymentCreated($payment))->delay(now()->addSeconds(1))
            );
            
            return response()->json([
                'message' => 'Payment created successfully.',
                'data'    => $payment
            ], 201);

        }
        catch (\Exception $e) {
            Log::error('Payment creation failed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to create payment.',
                'error'   => config('app.debug') ? $e->getMessage() : 'Server error.',
            ], 500);
        }

        
    }

    // display all payments - admin only and finance officers
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Authorization rules
        $allowed = $user->role === 'admin'
            || ($user->role === 'finance_officer'
                && optional($user->employee)->department === 'finance');

        if (!$allowed) {
            return response()->json([
                'message' => 'Only finance officers in finance department or admins can view payments.'
            ], 403);
        }


       $q = $request->all();
        // base query
        $query = Payment::query();

         // filters
        if (!empty($q['citizen_id'])) {
            $query->where('citizen_id', $q['citizen_id']);
        }

        if (!empty($q['payment_type'])) {
            $query->where('payment_type', $q['payment_type']);
        }

        if (!empty($q['status'])) {
            $query->where('status', $q['status']);
        }
         // single date
        if (!empty($q['date'])) {
            $query->whereDate('date', $q['date']);
        }

        // date range
        if (!empty($q['date_from'])) {
            $query->whereDate('date', '>=', $q['date_from']);
        }
        if (!empty($q['date_to'])) {
            $query->whereDate('date', '<=', $q['date_to']);
        }

         // sorting
        $sortBy = $q['sort_by'] ?? 'date';
        $sortDir = $q['sort_dir'] ?? 'desc';
        $result=$query->orderBy($sortBy, $sortDir)->paginate(5);

        return response()->json([
            'message' => 'Payments retrieved successfully.',
            'data' => $result
        ], 200);
    }

    // display a specific payment - admin only and finance officers and the specified citizen
    public function show(Request $request, Payment $payment): JsonResponse
    {
        $user = $request->user();
        // Authorization rules
        $allowed = $user->role === 'admin'
            || ($user->role === 'finance_officer'
                && optional($user->employee)->department === 'finance')
                || ($user->role === 'citizen' && $payment->citizen_id === $user->citizen->id);;

        if (!$allowed) {
            return response()->json([
                'message' => 'Only finance officers in finance department or admins can view payments.'
            ], 403);
        }
        // find payment with citizen relation
        $payment=Payment::with('citizen')->find($payment->id);

        if (!$payment) {
            return response()->json([
                'message' => 'Payment not found.'
            ], 404);
        }

        return response()->json([
            'message' => 'Payment retrieved successfully.',
            'data'    => $payment
        ], 200);


    }

    // update payment status - admin only and finance officers
    public function updateStatus(Request $request, Payment $payment): JsonResponse
    {
        $user = $request->user();
        // Authorization rules
        $allowed = $user->role === 'admin'
            || ($user->role === 'finance_officer'
                && optional($user->employee)->department === 'finance');
        if (!$allowed) {
            return response()->json([
                'message' => 'Only finance officers in finance department or admins can update payment status.'
            ], 403);
        }
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,completed,failed,refunded',
            'amount' => 'sometimes|numeric|min:0.01',
            'payment_type'=> 'sometimes|in:property_tax,water_bill,electricity_bill,waste_management,other',
        ]);

        if(empty($validated)){
            return response()->json([
                'message' => 'At least one field (amount, status, payment_type) must be provided for update.'
            ], 400);
        }
        try {
            $payment->update($validated);

            // Notify the citizen about the payment status update
            $payment->citizen->user->notify(new \App\Notifications\PaymentStatusUpdated($payment));

            return response()->json([
                'message' => 'Payment updated successfully.',
                'data'    => $payment
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update payment.',
                'error'   => config('app.debug') ? $e->getMessage() : 'Server error.',
            ], 500);
        }


    }
    // display payments of the authenticated citizen
    public function myPayments(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->role !== 'citizen') {
            return response()->json([
                'message' => 'Only citizens can view their payments.'
            ], 403);
        }
        if (!$user->citizen) {
            return response()->json([
                'message' => 'Citizen profile not found.'
            ], 404);
        }

        $q = Payment::where('citizen_id', $user->citizen->id);

        if($request->filled('status')){
            $q->where('status', $request->input('status'));
        }
        if($request->filled('payment_type')){
            $q->where('payment_type', $request->input('payment_type'));
        }
        if($request->filled('date')){
            $q->whereDate('date', $request->input('date'));
        }
        if($request->filled('date_from')){
            $q->whereDate('date', '>=', $request->input('date_from'));
        }
        if($request->filled('date_to')){
            $q->whereDate('date', '<=', $request->input('date_to'));

        }

        // sorting
        $sortBy = $request->sort_by ?? 'date';
        $sortDir = $request->sort_dir ?? 'desc';
        $perPage = (int) ($request->per_page ?? 15);

        $payments = $q->with('citizen')
                        ->orderBy($sortBy, $sortDir)
                        ->paginate(3);
                        

        return response()->json([
            'message' => 'Payments fetched successfully.',
            'data' => $payments
        ], 200);
    }

    // delete a payment - admin only or finance officers
    public function destroy(Payment $payment)
    {
        $user = auth()->user();
        // Authorization rules
        $allowed = $user->role === 'admin'
            || ($user->role === 'finance_officer'
                && optional($user->employee)->department === 'finance');
        if (!$allowed) {
            return response()->json([
                'message' => 'Only finance officers in finance department or admins can delete payments.'
            ], 403);
        }

        try {
            $payment->delete();

            return response()->json([
                'message' => 'Payment deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete payment.',
                'error'   => config('app.debug') ? $e->getMessage() : 'Server error.',
            ], 500);
        }
    }

    // begin stripe payment process
    public function beginStripePayment(Request $request, Payment $payment): JsonResponse
    {
        $user = $request->user();
        if ($user->role !== 'citizen' || $payment->citizen_id !==$user->citizen->id) {
            return response()->json([
                'message' => 'Unauthorized to initiate payment for this record.'
            ], 403);
        }

        // check if payment is already completed
        if ($payment->status === 'completed') {
            return response()->json([
                'message' => 'Payment is already completed.'
            ], 400);
        }

        try {
            Stripe::setApiKey(env('STRIPE_SECRET'));    
            // Create Stripe Checkout Session
            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => 'Municipality Payment #' . $payment->id,
                        ],
                        'unit_amount' => $payment->amount * 100, 
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'metadata' => [
                    'payment_id' => $payment->id
                ],
                // Redirect URLs
                'success_url' => URL::to('/payment-success/' . $payment->id),
                'cancel_url' => URL::to('/payment-cancel/' . $payment->id),
            ]);

            return response()->json([
                'checkout_url' => $session->url,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to initiate payment.',
                'error'   => config('app.debug') ? $e->getMessage() : 'Server error.',
            ], 500);
        }
    }




}

