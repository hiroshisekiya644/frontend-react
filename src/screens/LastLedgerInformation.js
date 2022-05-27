import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

let ws = null;

export default function LastLedgerInformation({ server }) {
  const { t } = useTranslation();

  const [ledger, setLedger] = useState(null);
  const [connected, setConnected] = useState(false);

  const connect = () => {
    const wssServer = server.replace("https://", "wss://") + '/wss';
    ws = new WebSocket(wssServer);

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ command: "subscribe", streams: ["ledger"], id: 1 }));
    }

    ws.onmessage = evt => {
      const message = JSON.parse(evt.data);
      setLedger(message);

      /* 
        {
          "type": "ledgerClosed",
          "lastClose": {
            "convergeTimeS": 2,
            "proposers": 6
          },
          "validationQuorum": 5,
          "validatedLedgers": "27887240-28102846",
          "validatedLedger": {
            "type": "ledgerClosed",
            "hash": "7B4C03BC011499AAF8A7605D1D0CC17170B255AAD9488A33DB68589F240C6ED0",
            "baseFeeXRP": "0.00001",
            "reserveBaseXRP": "10",
            "reserveIncrementXRP": "2",
            "ledgerTime": 706913181,
            "ledgerIndex": 28102846,
            "transactionsCount": 9
          }
        } 
      */
    }

    ws.onclose = () => {
      setConnected(false);
    }
  }

  useEffect(() => {
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onConnect = () => {
    connect();
  }

  return (
    <div className="content-text content-center">
      <h1 className="center">{t("menu.last-ledger-information")}</h1>
      <div className="bordered brake" style={{ padding: "0 20px", position: "relative" }}>
        <p>{t("last-ledger-information.ledger-hash")}: {ledger?.validatedLedger.hash.toLowerCase()}</p>
        <p>{t("last-ledger-information.ledger")}: {ledger?.validatedLedger.ledgerIndex && '#' + ledger.validatedLedger.ledgerIndex}</p>
        <p>{t("last-ledger-information.ledger-closed-at")}: {ledger?.validatedLedger.ledgerTime}</p>
        <p>{t("last-ledger-information.transactions")}: {ledger?.validatedLedger.transactionsCount}</p>
        <p>{t("last-ledger-information.proposers")}: {ledger?.lastClose.proposers}</p>
        <p>{t("last-ledger-information.validation-quorum")}: {ledger?.validationQuorum}</p>
        <p>{t("last-ledger-information.base-fee")}: {ledger?.validatedLedger.baseFeeXRP && ledger.validatedLedger.baseFeeXRP + ' XRP'}</p>
        <p>{t("last-ledger-information.base-reserve")}: {ledger?.validatedLedger.reserveBaseXRP && ledger.validatedLedger.reserveBaseXRP + ' XRP'}</p>
        <p>{t("last-ledger-information.increment-reserve")}: {ledger?.validatedLedger.reserveIncrementXRP && ledger.validatedLedger.reserveIncrementXRP + ' XRP'}</p>
        <p className="center" style={{ position: "absolute", top: "calc(50% - 72px)", left: "calc(50% - 54px)" }}>
          {!ledger && <span className="waiting"></span>}
        </p>
      </div>

      {!connected && ledger &&
        <p className="center">
          <input type="button" value={t("last-ledger-information.reconnect")} className="button-action" onClick={onConnect} />
        </p>
      }
    </div>
  );
};
