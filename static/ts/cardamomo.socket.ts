export class CardamomoSocket {

  private path : string
  private ws = null;

  private id : string;

  private _actions = [];
  private _onOpen = null;

  constructor(path : string) {
    this.openSocket(path);
  }

  private openSocket(path) {
    path = path.replace('http://', '');
    path = path.replace('https://', '');
    path = path.replace('ws://', '');
    path = path.replace('wss://', '');
    path = "ws://" + path;
    this.path = path;

    this.ws = new WebSocket(this.path);
    this.ws.onopen = (event) => {
      this.send("CardamomoSocketInit", "{}");

      this.ws.onmessage = (event) => {
        try {
          var data = JSON.parse(event.data);
          if( data.Action == "CardamomoSocketInit" ) {
            this.id = data.Params.id;

            if(this._onOpen != null) {
              this._onOpen();
            }
          } else {
            for( var i in this._actions ) {
              var action = this._actions[i];
              if( action.action == data.Action ) {
                action.callback(data.Params);
              }
            }
          }
        } catch(e) {}
      }
    };

    this.ws.onclose = () => {
      console.log("Disconnect!");
      //try to reconnect in 5 seconds
      setTimeout(
      () => {
        this.openSocket(this.path);
      },5000);
    };
  }

  send(action, params) {
    var message = {
        "action": action,
        "params": JSON.stringify(params)
    };

    var messageStr = JSON.stringify(message);
    this.ws.send(messageStr);
  }

  on = (action, callback) => {
    this._actions.push({"action": action, "callback": callback});
  }

  onOpen = (callback) => {
    this._onOpen = callback;
  };
}
