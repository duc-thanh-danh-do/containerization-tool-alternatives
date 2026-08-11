package com.example.EcomSphere.Helper

class ForbiddenActionException (message: String) : RuntimeException(message)
class EmailAlreadyVerifiedException(message: String) : RuntimeException(message)
class AlreadyASellerException(message: String) : RuntimeException(message)
class NotFoundActionException(message: String): RuntimeException(message)