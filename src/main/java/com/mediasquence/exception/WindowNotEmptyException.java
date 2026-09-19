package com.mediasquence.exception;

import org.springframework.http.HttpStatus;

public class WindowNotEmptyException extends BaseRuntimeException {

    private static final long serialVersionUID = 1L;

    public WindowNotEmptyException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
