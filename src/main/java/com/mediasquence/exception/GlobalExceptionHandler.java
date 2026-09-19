package com.mediasquence.exception;

import com.mediasquence.dto.response.GenericResponseHandlers;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
	
    @ExceptionHandler(Throwable.class)
    public ResponseEntity<Object> handleControllerException(final HttpServletRequest request, final Throwable exception) {
        HttpStatus status;
        String message;

        log.error("Exception handling request [{} {}]: {}", request.getMethod(), request.getRequestURI(), exception.getMessage());

        if (exception instanceof WindowNotEmptyException windowNotEmptyException) {
            status = HttpStatus.CONFLICT;
            message = windowNotEmptyException.getMessage();
            log.warn("WindowNotEmptyException occurred on [{} {}]: {}", request.getMethod(), request.getRequestURI(), message);
        }
        else if (exception instanceof ResourceNotFoundException resourceNotFoundException) {
            status = HttpStatus.NOT_FOUND;
            message = resourceNotFoundException.getMessage();
            log.warn("Resource not found exception occurred: {}", message);
        }
        else if (exception instanceof BaseRuntimeException baseRuntimeException) {
            status = baseRuntimeException.getStatus() != null ? baseRuntimeException.getStatus() : HttpStatus.BAD_REQUEST;
            message = baseRuntimeException.getMessage();
            log.warn("BaseRuntimeException occurred: {}", message);
        }
        else if (exception instanceof NoResourceFoundException noResourceException) {
            status = HttpStatus.NOT_FOUND;
            message = "Resource not found: " + request.getRequestURI();
            log.warn("Static resource not found on URL: {}", request.getRequestURL());
        }
        else if (exception instanceof MethodArgumentNotValidException validationException) {
            status = HttpStatus.BAD_REQUEST;
            message = validationException.getFieldErrors().stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.joining(", "));
            log.warn("Validation failed: {}", message);
        }
        else if (exception instanceof HandlerMethodValidationException validationException) {
            status = HttpStatus.BAD_REQUEST;
            message = validationException.getParameterValidationResults().stream()
                    .flatMap(result -> result.getResolvableErrors().stream())
                    .map(org.springframework.context.MessageSourceResolvable::getDefaultMessage)
                    .collect(Collectors.joining(", "));
            log.warn("Validation failed (method): {}", message);
        }
        else if (exception instanceof IllegalArgumentException || exception instanceof IllegalStateException) {
            status = HttpStatus.BAD_REQUEST;
            message = exception.getMessage();
            log.warn("Invalid request argument/state: {}", message);
        }
        else if (exception instanceof HttpMessageNotReadableException) {
            status = HttpStatus.BAD_REQUEST;
            Throwable cause = exception.getCause();
            String detail = (cause != null && cause.getMessage() != null) ? cause.getMessage() : exception.getMessage();
            message = "Invalid or unreadable request payload: " + detail;
            log.warn("HttpMessageNotReadableException on URL {}: {}", request.getRequestURL(), detail);
        }
        else if (exception instanceof MissingServletRequestParameterException
                || exception instanceof MissingRequestHeaderException
                || exception instanceof MethodArgumentTypeMismatchException) {
            status = HttpStatus.BAD_REQUEST;
            message = "Invalid or missing request parameter";
            log.warn("Request parameter error on URL: {}", request.getRequestURL());
        }
        else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = "An unexpected server error occurred. Please try again later.";
            log.info("Requested URL: {}", request.getRequestURL());
            log.error("Unhandled exception details: ", exception);
        }

        return new GenericResponseHandlers.Builder()
                .setStatus(status)
                .setMessage(message)
                .create();
    }
}
