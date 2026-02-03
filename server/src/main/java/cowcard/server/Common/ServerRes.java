package cowcard.server.Common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ServerRes<T> {
    private T data;
    private String message;
    private boolean success;

    public static <T> ServerRes<T> success(T data, String message) {
        return new ServerRes<>(data, message, true);
    }

    public static <T> ServerRes<T> success(T data) {
        return new ServerRes<>(data, "success", true);
    }

    public static <T> ServerRes<T> success() {
        return new ServerRes<>(null, "success", true);
    }

    public static <T> ServerRes<T> error(String message) {
        return new ServerRes<>(null, message, false);
    }
}
