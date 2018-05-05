using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace Microsoft.Skype.Interviews.Samples.DevHub.hubs
{
    public class AddinsHub : Hub<IAddinsHub>
    {
        private static readonly ConcurrentDictionary<string, TokenInfo> ConnectionInfo 
            = new ConcurrentDictionary<string, TokenInfo>();

        private static readonly ConcurrentDictionary<string, string> SessionContext 
            = new ConcurrentDictionary<string, string>();

        public void SendMessage(AddinMessageRequest message)
        {
            if (ConnectionInfo.TryGetValue(this.Context.ConnectionId, out var tokenInfo))
            {
                this.Clients.OthersInGroup(tokenInfo.asid).messageReceived(message);
            }
        }

        public void StoreContext(string content)
        {
            if (ConnectionInfo.TryGetValue(this.Context.ConnectionId, out var tokenInfo))
            {
                SessionContext.TryAdd(tokenInfo.asid, content);
            }
        }

        public void FetchContext()
        {
            if (ConnectionInfo.TryGetValue(this.Context.ConnectionId, out var tokenInfo))
            {
                if (SessionContext.TryGetValue(tokenInfo.asid, out var context))
                {
                    this.Clients.Caller.contextFetched(context);
                    return;
                }
            }

            this.Clients.Caller.contextFetched("");
        }

        public override async Task OnConnectedAsync()
        {
            var token = JsonConvert.DeserializeObject<TokenInfo>(this.Context.GetHttpContext().Request.Query["token"]);
            ConnectionInfo.AddOrUpdate(this.Context.ConnectionId, s => token, (s, info) => token);

            await this.Groups.AddAsync(this.Context.ConnectionId, token.asid);

            await base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            ConnectionInfo.TryRemove(this.Context.ConnectionId, out var token);
            return base.OnDisconnectedAsync(exception);
       }
    }

    public class TokenInfo
    {
        public string adid { get; set; }
        public string asid { get; set; }
        public string auid { get; set; }
        public string sid { get; set; }
    }

}