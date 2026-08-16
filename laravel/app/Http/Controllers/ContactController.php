<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    protected const WHATSAPP_NUMBER = '917749028081';

    public function send(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'fullname' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150'],
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $text = "New portfolio message\n\n"
            ."Name: {$validated['fullname']}\n"
            ."Email: {$validated['email']}\n"
            ."Message: {$validated['message']}";

        $whatsappUrl = 'https://wa.me/'.self::WHATSAPP_NUMBER.'?text='.rawurlencode($text);

        return redirect()->away($whatsappUrl);
    }
}
