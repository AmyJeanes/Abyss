using Abyss.Web.Data.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Net;
using System.Text.Json;

namespace Abyss.Web.Controllers;

[ApiController]
[Route("api/webhookrelay")]
public class WebhookRelayController : Controller
{
    private readonly WebhookRelayOptions _options;
    private readonly HttpClient _client;

    public WebhookRelayController(IOptions<WebhookRelayOptions> options, HttpClient client)
    {
        _options = options.Value;
        _client = client;
    }

    [HttpPost("{name}/{key}")]
    public async Task<IActionResult> Relay([FromRoute] string name, [FromRoute] string key)
    {
        var relay = _options.Relays.FirstOrDefault(x => x.Key.Equals(name, StringComparison.InvariantCultureIgnoreCase));
        if (relay.Equals(default(KeyValuePair<string, WebhookRelayOptions.WebhookRelay>)))
        {
            return NotFound();
        }

        if (string.IsNullOrEmpty(relay.Value.Key) || key != relay.Value.Key)
        {
            return Unauthorized();
        }

        using var bodyStream = new MemoryStream();
        await Request.Body.CopyToAsync(bodyStream);
        var body = bodyStream.ToArray();

        var (sender, isBot) = GetSender(body);
        if (relay.Value.IgnoreBots && isBot)
        {
            return Ok($"Ignored webhook from '{sender}'");
        }

        var statusCode = HttpStatusCode.Accepted;
        var resp = string.Empty;
        foreach (var url in relay.Value.Urls)
        {
            using var req = new HttpRequestMessage(new HttpMethod(Request.Method), url);
            foreach (var header in Request.Headers.Where(x => x.Key != "Host"))
            {
                req.Headers.TryAddWithoutValidation(header.Key, header.Value.AsEnumerable());
            }
            ;
            req.Content = new ByteArrayContent(body);
            if (Request.Headers.ContainsKey("Content-Type"))
            {
                req.Content.Headers.Add("Content-Type", Request.ContentType);
            }
            var res = await _client.SendAsync(req);
            if (!res.IsSuccessStatusCode)
            {
                statusCode = res.StatusCode;
                resp = await res.Content.ReadAsStringAsync();
            }
        }

        return StatusCode((int)statusCode, resp);
    }

    private static (string Login, bool IsBot) GetSender(byte[] body)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;
            if (root.ValueKind == JsonValueKind.Object
                && root.TryGetProperty("sender", out var sender) && sender.ValueKind == JsonValueKind.Object)
            {
                var login = sender.TryGetProperty("login", out var l) && l.ValueKind == JsonValueKind.String
                    ? l.GetString()
                    : null;
                var isBot = sender.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String
                    && string.Equals(t.GetString(), "Bot", StringComparison.OrdinalIgnoreCase);
                return (login, isBot);
            }
        }
        catch (JsonException) { }

        return (null, false);
    }
}
