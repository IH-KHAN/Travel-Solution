import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: signalR.HubConnection | undefined;
  
  public activityUpdate$ = new Subject<any>();
  public travellerUpdate$ = new Subject<any>();
  public auditUpdate$ = new Subject<any>();

  constructor() { }

  public startConnection = () => {
    // URL matching our .NET backend
    this.hubConnection = new signalR.HubConnectionBuilder()
                            .withUrl('http://localhost:5246/activityHub', { // Correct port.
                                skipNegotiation: true,
                                transport: signalR.HttpTransportType.WebSockets
                            })
                            .withAutomaticReconnect()
                            .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));

    this.hubConnection.on('ReceiveActivityUpdate', (data) => {
      console.log('Real-time update received:', data);
      this.activityUpdate$.next(data);
    });

    this.hubConnection.on('ReceiveTravellerUpdate', (data) => {
      console.log('Real-time traveller update received:', data);
      this.travellerUpdate$.next(data);
    });

    this.hubConnection.on('ReceiveAuditUpdate', (data) => {
      console.log('Real-time audit update received:', data);
      this.auditUpdate$.next(data);
    });
  }
}
