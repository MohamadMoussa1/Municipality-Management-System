<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Permit;
use Illuminate\Auth\Access\HandlesAuthorization;

class PermitPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
    return $user->hasRole('admin') || $user->hasRole('clerk');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Permit $permit): bool
    {
        // Admins and clerks can view any permit
        if ($user->hasAnyRole(['admin', 'clerk'])) {
            return true;
        }

        // Citizens can only view their own permits
        return $user->citizen && $user->citizen->id === $permit->applicant_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only citizens can create permits
        return $user->hasRole('citizen');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Permit $permit): bool
    {
        // Only admins and clerk can update permits
        if ($user->hasAnyRole(['admin', 'clerk'])) {
            return true;
        }
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Permit $permit): bool
    {
        // Only admins can delete permits
        return $user->hasRole('admin');
    }
}
