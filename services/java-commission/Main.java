import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/** Pantrix Estates - Java commission service (port 8002). Maven ki zaroorat nahi. */
public class Main {
    static Map<String, String> query(HttpExchange ex) {
        Map<String, String> map = new HashMap<>();
        String q = ex.getRequestURI().getRawQuery();
        if (q == null) return map;
        for (String pair : q.split("&")) {
            String[] kv = pair.split("=", 2);
            map.put(kv[0], kv.length > 1 ? kv[1] : "");
        }
        return map;
    }

    static double number(String s) {
        try { return Double.parseDouble(s); } catch (Exception e) { return 0; }
    }

    static void send(HttpExchange ex, int code, String json) throws IOException {
        byte[] body = json.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().add("Content-Type", "application/json");
        ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        ex.sendResponseHeaders(code, body.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(body); }
    }

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8002), 0);

        server.createContext("/health", ex -> send(ex, 200, "{\"ok\":true,\"service\":\"java-commission\"}"));

        server.createContext("/commission", ex -> {
            Map<String, String> q = query(ex);
            double price = number(q.get("price"));
            boolean rent = "rent".equals(q.get("type"));
            double rate = rent ? 8.33 : 2.0;
            long total = Math.round(price * rate / 100.0);
            long agent = Math.round(total * 0.6);
            long agency = total - agent;
            send(ex, 200, String.format("{\"rate\":%s,\"total\":%d,\"agent\":%d,\"agency\":%d}", rate, total, agent, agency));
        });

        server.start();
        System.out.println("Java commission service running on http://localhost:8002");
    }
}
