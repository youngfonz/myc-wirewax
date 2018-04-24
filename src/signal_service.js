
import ServerPush from './server_push';

let g_pusher_channel = null;

function initSignalService(room_name,message_processors) {
  if (!g_pusher_channel) {
    const channel = _pusher_client.subscribe('private-' + room_name);

    channel.bind('pusher:subscription_succeeded', () => {
      if(message_processors.connect) {
        message_processors.connect();
      }
    });
    channel.bind('client-message', function(data) {
      if(message_processors.message) {
        message_processors.message(data);
      } else if (message_processors.client_message) {
        message_processors.client_message(data);
      }
    });

    g_pusher_channel = channel;
  }
}

function sendMessage(payload, source_peer_id, dest_peer_id) {
  if (g_pusher_channel) {
    const message_body = {
      message: payload,
      source_peer_id: source_peer_id
    };

    if(dest_peer_id) {
      message_body.dest_peer_id = dest_peer_id;
    }

    // "client-" required by pusher for all client messages
    g_pusher_channel.trigger('client-message', message_body);
  }
}

export default {
  initSignalService,
  sendMessage
};
