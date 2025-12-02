<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\Payment\IndexPaymentsRequest;
use App\Http\Resources\PaymentsResource\PaymentResource;


class PaymentController extends Controller
{

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
                'date'         => $validated['date'],
                'status'       => $validated['status'] ?? 'pending',
            ]);

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
        $query->orderBy($sortBy, $sortDir);

        // pagination:may be modified later
        $perPage = $q['per_page'] ?? 15;
        $payments = $query->with('citizen')->paginate($perPage)->appends($request->query());
              


        return response()->json([
            'message' => 'Payments retrieved successfully.',
            'data' =>  PaymentResource::collection($payments)
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
                || ($user->role === 'citizen' && $payment->citizen_id === $user->id);;

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
                        ->paginate($perPage)
                        ->appends($request->query());

        return response()->json([
            'message' => 'Payments fetched successfully.',
            'data' => PaymentResource::collection($payments)
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




}

