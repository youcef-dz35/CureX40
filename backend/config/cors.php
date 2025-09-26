<?php

return [
    "paths" => ["api/*", "sanctum/csrf-cookie"],

    "allowed_methods" => ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    "allowed_origins" => [
        env("FRONTEND_URL", "http://localhost:5173"),
        "http://localhost:5173",
        "http://localhost:5174",
    ],

    "allowed_origins_patterns" => [],

    "allowed_headers" => ["*"],

    "exposed_headers" => [],

    "max_age" => 0,

    "supports_credentials" => true,
];
