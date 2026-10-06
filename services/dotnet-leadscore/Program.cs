// Pantrix Estates - C# / .NET 8 lead scoring service (port 8003)
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:8003");
var app = builder.Build();

app.MapGet("/health", () => Results.Json(new { ok = true, service = "dotnet-leadscore" }));

app.MapGet("/lead-score", (double budget, double price, bool hasPhone, int messageLength) =>
{
    var score = 20;
    if (hasPhone) score += 25;
    if (messageLength > 60) score += 15;
    if (budget > 0 && price > 0)
        score += budget >= price ? 40 : budget >= price * 0.8 ? 25 : 5;
    score = Math.Min(score, 100);
    var grade = score >= 70 ? "Hot" : score >= 45 ? "Warm" : "Cold";
    return Results.Json(new { score, grade });
});

app.Run();
