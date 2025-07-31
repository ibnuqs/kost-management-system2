<?php

// config/mqtt.php

return [
    'host' => env('HIVEMQ_HOST', 'broker.hivemq.com'),
    'port' => env('HIVEMQ_PORT', 1883),
    'username' => env('HIVEMQ_USERNAME'),
    'password' => env('HIVEMQ_PASSWORD'),
    'client_id' => env('MQTT_CLIENT_ID', 'kost_system_'.uniqid()),
    'topic_prefix' => env('MQTT_TOPIC_PREFIX', 'kost_system'),
];
