<?php
namespace App\Services;

class QrisGeneratorService
{
    /**
     * Parse EMVCo TLV string into associative array of tags.
     */
    public function parseTLV(string $payload): array
    {
        $i = 0;
        $out = [];
        $len = strlen($payload);
        while ($i + 4 <= $len) {
            $tag = substr($payload, $i, 2);
            $i += 2;
            $lenStr = substr($payload, $i, 2);
            $i += 2;
            $valueLen = (int) $lenStr;
            if ($i + $valueLen > $len) {
                break;
            }
            $value = substr($payload, $i, $valueLen);
            $i += $valueLen;
            $out[$tag] = $value;
        }
        return $out;
    }

    /** Build TLV string from associative array preserving order. */
    public function buildTLV(array $items): string
    {
        $payload = '';
        foreach ($items as $tag => $value) {
            $payload .= $tag . str_pad((string)strlen($value), 2, '0', STR_PAD_LEFT) . $value;
        }
        return $payload;
    }

    /** Remove CRC tag (63) */
    public function removeCRC(array $items): array
    {
        unset($items['63']);
        return $items;
    }

    /** Insert or replace a tag */
    public function setTag(array $items, string $tag, string $value): array
    {
        $items[$tag] = $value;
        return $items;
    }

    /** Compute CRC16-CCITT (XModem) */
    public function computeCRC(string $payloadWoCRC): string
    {
        // Append CRC placeholder
        $data = $payloadWoCRC . '6304';
        $bytes = array_values(unpack('C*', $data));
        $crc = 0xFFFF;
        foreach ($bytes as $b) {
            $crc ^= ($b << 8) & 0xFFFF;
            for ($i = 0; $i < 8; $i++) {
                if ($crc & 0x8000) {
                    $crc = (($crc << 1) & 0xFFFF) ^ 0x1021;
                } else {
                    $crc = ($crc << 1) & 0xFFFF;
                }
            }
        }
        return strtoupper(str_pad(dechex($crc & 0xFFFF), 4, '0', STR_PAD_LEFT));
    }

    /** Generate final QRIS payload with amount and optional txn (Tag 62 sub‑field 05) */
    public function generate(string $staticPayload, int $amount, ?string $txn = null): string
    {
        $items = $this->parseTLV($staticPayload);
        $items = $this->removeCRC($items);
        $items = $this->setTag($items, '54', (string)$amount);
        if ($txn) {
            // Tag 62 subfield 05 – value length prefixed
            $sub = '05' . str_pad((string)strlen($txn), 2, '0', STR_PAD_LEFT) . $txn;
            $items = $this->setTag($items, '62', $sub);
        }
        $payloadWoCRC = $this->buildTLV($items);
        $crc = $this->computeCRC($payloadWoCRC);
        return $payloadWoCRC . '63' . '04' . $crc;
    }
}
?>
