const { app, BrowserWindow, Menu, ipcMain, shell, ipcRenderer } = require('electron')
var net = require('net');
var dns = require('dns');

function IPCheck(ip) {  
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {  
        return (true);
    } else return (false);
} 

async function connect(host, port){
    return new Promise((res, rej) => {
        net.connect({host : host, port: port}, () => {
        res(true);
        }).on("error", err => {
            rej(err);
        });
    });
}

async function scan(IP, Start, End, callback, window){
    if(IPCheck(IP)){
        if(!net.isIPv4(IP) && !net.isIPv6(IP)){
            callback('output', {
                message: "Please Enter A Valid IP Address!",
                backgroundColor: "#414241",
                color: 'red'
            })
        } else {
            if(Start == ''){
                Start = 80;
            } else Start = Number(Start);
            if(End == ''){
                End = 65000;
            } else End = Number(End);
            let start = Start;
            let stop = End;
            
            for(let port = start; port <= stop; port++){
                window.setProgressBar((port-start)/(stop-start));
                callback('progress', {color: "green", state: (Math.round((((port-start)/(stop-start))*100) * 100) / 100).toFixed(0)});
                try{
                    await connect(IP, port);
                    callback('output', {
                        message: `Port ${port} Is Open`,
                        backgroundColor: "#414241",
                        color: 'green'
                    })
                }catch(e){
                    callback('output', {
                        message: `Port ${port} Is Closed`,
                        backgroundColor: "#414241",
                        color: 'red'
                    })
                }
            }
        }
    } else if(/.+?\..+/.test(IP)){
        try {
            dns.resolve(IP, async function(err, ret){
                if(err){
                    callback('output', {
                        message: err,
                        backgroundColor: "#414241",
                        color: 'red'
                    })
                }
                callback('output', {
                    message: ret[0],
                    backgroundColor: "#414241",
                    color: 'white'
                })
                if(Start == ''){
                    Start = 80;
                } else Start = Number(Start);
                if(End == ''){
                    End = 65000;
                } else End = Number(End);
                let start = Start;
                let stop = End;
                for(let port = start; port <= stop; port++){
                    window.setProgressBar((port-start)/(stop-start));
                    callback('progress', {color: "green", state: (Math.round((((port-start)/(stop-start))*100) * 100) / 100).toFixed(0)});
                    try{
                        await connect(IP, port);
                        callback('output', {
                            message: `Port ${port} Is Open`,
                            backgroundColor: "#414241",
                            color: 'green'
                        })
                    }catch(e){
                        callback('output', {
                            message: `Port ${port} Is Closed`,
                            backgroundColor: "#414241",
                            color: 'red'
                        })
                    }
                }
            })
        } catch(e){
            if(e){
                callback('output', {
                    message: e,
                    backgroundColor: "#414241",
                    color: 'red'
                })
            }
        }
    } else {
        callback('output', {
            message: "Please Enter A Valid IP!",
            backgroundColor: "#414241",
            color: 'red'
        })
    }
}

function createWindow () {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 400,
        height: 557,
        webPreferences: {
            nodeIntegration: true
        },
        icon: './PortScanner.ico'
    })

    // and load the index.html of the app.
    win.loadFile('index.html');
    win.setMenu(null);
    ipcMain.on('input', (event, arg) => {
        scan(arg.IP, arg.Start, arg.End, event.reply, win);
    });
}

app.whenReady().then(createWindow)