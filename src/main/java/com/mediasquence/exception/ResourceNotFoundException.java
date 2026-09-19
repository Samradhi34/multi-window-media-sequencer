package com.mediasquence.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BaseRuntimeException {

    private static final long serialVersionUID = 7296602984630561820L;

    private static final HttpStatus status = HttpStatus.NOT_FOUND;

	
	public ResourceNotFoundException() {
	}

	public ResourceNotFoundException(final String message, final Throwable cause) {
		super(status, message, cause);
	}

	
	public ResourceNotFoundException(final String message) {
		super(status, message);
	}

	public ResourceNotFoundException(final Throwable cause) {
		super(status, cause);
	}
}
