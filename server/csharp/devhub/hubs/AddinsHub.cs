using Microsoft.AspNetCore.SignalR;
using Microsoft.Skype.Interviews.Samples.DevHub.Extensions;
using System;
using System.Threading.Tasks;

namespace Microsoft.Skype.Interviews.Samples.DevHub.hubs
{
    public class AddinsHub : Hub<IAddinsHub>
    {
        const string TEST_ASID = "TEST_ASID";

        public async Task SendMessage(AddinMessageRequest message)
        {
            message.ServerTimeStamp = DateTime.UtcNow.ConvertToJsFormat();
            await this.Clients.OthersInGroup(TEST_ASID).MessageReceived(message);
        }

        public void StoreContext(string content)
        {
            throw new NotImplementedException();
        }

        public string FetchContext()
        {
            throw new NotImplementedException();
        }

        public override async Task OnConnectedAsync()
        {
            await this.Groups.AddToGroupAsync(this.Context.ConnectionId, TEST_ASID);
            await base.OnConnectedAsync();
        }
    }
}