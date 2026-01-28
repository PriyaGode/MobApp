package com.OriginHubs.Amraj.dto;

public enum UserSortField {
    NAME("fullName"),
    LAST_LOGIN("lastLogin");

    private final String column;

    UserSortField(String column) {
        this.column = column;
    }

    public String getColumn() {
        return column;
    }

    public static UserSortField fromParam(String value) {
        if (value == null || value.isBlank()) {
            return NAME;
        }
        for (UserSortField field : values()) {
            if (field.name().equalsIgnoreCase(value)) {
                return field;
            }
        }
        return NAME;
    }
}
