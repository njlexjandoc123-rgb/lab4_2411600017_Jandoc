<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$courses = [
    ["id" => 1, "code" => "WEB101", "name" => "Web Systems and Technologies", "category" => "IT", "instructor" => "Prof. Santos", "units" => 3, "grade" => 94],
    ["id" => 2, "code" => "IT201", "name" => "Data Structures and Algorithms", "category" => "IT", "instructor" => "Prof. Reyes", "units" => 3, "grade" => 88],
    ["id" => 3, "code" => "IT202", "name" => "Database Management Systems", "category" => "IT", "instructor" => "Prof. Garcia", "units" => 3, "grade" => 91],
    ["id" => 4, "code" => "MATH201", "name" => "Discrete Mathematics", "category" => "MATH", "instructor" => "Prof. Cruz", "units" => 3, "grade" => 85],
    ["id" => 5, "code" => "IT203", "name" => "Networking Fundamentals", "category" => "IT", "instructor" => "Prof. Mendoza", "units" => 3, "grade" => 72],
    ["id" => 6, "code" => "GE105", "name" => "Ethics", "category" => "GE", "instructor" => "Prof. Bautista", "units" => 2, "grade" => 96]
];

echo json_encode($courses);
?>  