<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'CureX40 API',
        'version' => 'v1',
        'status' => 'ok',
    ]);
});


