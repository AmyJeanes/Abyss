using Abyss.Web.Data.Options;
using Abyss.Web.Data.TeamSpeak;
using Abyss.Web.Helpers.Interfaces;
using Microsoft.Extensions.Options;
using System.Text.Json.Serialization;

namespace Abyss.Web.Helpers;

public class TeamSpeakHelper(
    IOptions<TeamSpeakOptions> options,
    HttpClient httpClient,
    ILogger<TeamSpeakHelper> logger
        ) : ITeamSpeakHelper
{
    private readonly TeamSpeakOptions _options = options.Value;
    private readonly HttpClient _httpClient = httpClient;
    private readonly ILogger<TeamSpeakHelper> _logger = logger;

    public async Task<List<Client>> GetClients()
    {
        var clientListResponse = await _httpClient.GetAsync($"{_options.ServerId}/clientlist");
        clientListResponse.EnsureSuccessStatusCode();
        var clientListContent = await clientListResponse.Content.ReadFromJsonAsync<TeamSpeakResponse<List<TeamSpeakClientListResponse>>>();
        var clients = new List<Client>();
        foreach (var client in clientListContent.Body)
        {
            if (int.Parse(client.Type) != 0) { continue; }
            var clientResponse = await _httpClient.GetAsync($"{_options.ServerId}/clientinfo?clid={client.Id}");
            clientResponse.EnsureSuccessStatusCode();
            var clientContent = await clientResponse.Content.ReadFromJsonAsync<TeamSpeakResponse<List<TeamSpeakClientResponse>>>();
            var clientInfo = clientContent.Body.FirstOrDefault();
            clients.Add(new Client
            {
                Name = client.Name,
                ChannelId = int.Parse(client.ChannelId),
                ConnectedSeconds = int.Parse(clientInfo.ConnectedMilliseconds) / 1000,
                IdleSeconds = int.Parse(clientInfo.IdleMilliseconds) / 1000
            });
        }
        return clients;
    }

    public async Task<List<Channel>> GetChannels()
    {
        var channelResponse = await _httpClient.GetAsync($"{_options.ServerId}/channellist");
        channelResponse.EnsureSuccessStatusCode();
        var channelContent = await channelResponse.Content.ReadFromJsonAsync<TeamSpeakResponse<List<TeamSpeakChannelResponse>>>();

        return channelContent?.Body?.Select(c => new Channel
        {
            Id = int.Parse(c.Id),
            ParentId = int.Parse(c.ParentId),
            Name = c.Name,
        }).ToList() ?? [];
    }

    private class TeamSpeakResponse<T>
    {
        public T Body { get; set; }
    }

    private class TeamSpeakChannelResponse
    {
        [JsonPropertyName("cid")]
        public string Id { get; set; }

        [JsonPropertyName("pid")]
        public string ParentId { get; set; }

        [JsonPropertyName("channel_name")]
        public string Name { get; set; }

        [JsonPropertyName("channel_order")]
        public string Order { get; set; }
    }

    public enum TeamSpeakClientType
    {
        Normal = 0,
        Query = 1,
        ServerQuery = 2,
        VirtualServer = 3
    }

    private class TeamSpeakClientListResponse
    {
        [JsonPropertyName("clid")]
        public string Id { get; set; }

        [JsonPropertyName("client_nickname")]
        public string Name { get; set; }

        [JsonPropertyName("cid")]
        public string ChannelId { get; set; }

        [JsonPropertyName("client_type")]
        public string Type { get; set; }
    }

    private class TeamSpeakClientResponse
    {
        [JsonPropertyName("cid")]
        public string Id { get; set; }

        [JsonPropertyName("client_nickname")]
        public string Name { get; set; }

        [JsonPropertyName("client_idle_time")]
        public string IdleMilliseconds { get; set; }

        [JsonPropertyName("connection_connected_time")]
        public string ConnectedMilliseconds { get; set; }
    }
}
