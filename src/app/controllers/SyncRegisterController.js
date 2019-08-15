import fs from 'fs';
import { resolve } from 'path';
import { format, parse } from 'date-fns';

import Register from '../models/Register';

class SyncRegisterController {
    async store(req, res) {
        const file = resolve(__dirname, '..', '..', '..', 'registros.json');
        
        fs.readFile(file, async (err, data) => {
            if (err) throw new Error();

            const registers = JSON.parse(data.toString())[2].data;

            const formattedRegisters = registers.map(register => {
                if (register.excluido === '1') {
                    return;
                }

                return {
                    id: Number(register.id),
                    client_id: Number(register.cod_cliente),
                    warranty_type_id: Number(register.zero_hora) === 0 ? 1 : 2,
                    status_id: Number(register.status),
                    product_id: Number(register.cod_produto),
                    entry_invoice: Number(register.nota_entrada),
                    entry_date: parse(format(register.data_entrada, "YYYY-MM-DD")),
                    delivery_cost: Number(register.custo_frete) > 0 ? Number(register.custo_frete) : null,
                    repair_cost: Number(register.custo_conserto) > 0 ? Number(register.custo_conserto) : null,
                    exchange_value: Number(register.credito_troca) > 0 ? Number(register.credito_troca) : null,
                    exchange_mail: false,
                    last_status_date: register.ultimo_status !== ("" || "0000-00-00") ? parse(format(register.ultimo_status, "YYYY-MM-DD")) : null,
                    register_observations: register.observacoes !== "" ? register.observacoes : null,
                    serial_number: register.serial_number !== "" ? register.serial_number : null
                }
            })

            await Promise.all(formattedRegisters.map(async reg => {
                await Register.create(reg);
            }))

            return res.json({ ok: true });
        })
    }
}

export default new SyncRegisterController();