import { Argument, ByzCoinRPC, ClientTransaction, Instruction } from "@dedis/cothority/byzcoin";
import { AddTxResponse } from "@dedis/cothority/byzcoin/proto/requests";
import ISigner from "@dedis/cothority/darc/signer";

export class Transaction {
    private instructions: Instruction[] = [];

    constructor(protected bc: ByzCoinRPC) {
    }

    async send(signers: ISigner[][], wait = 0): Promise<[ClientTransaction, AddTxResponse]> {
        const ctx = ClientTransaction.make(this.bc.getProtocolVersion(), ...this.instructions);
        this.instructions = [];
        await ctx.updateCountersAndSign(this.bc, signers);
        return [ctx, await this.bc.sendTransactionAndWait(ctx, wait)];
    }

    push(inst: Instruction): Instruction {
        this.instructions.push(inst);
        return inst;
    }

    unshift(inst: Instruction): Instruction {
        this.instructions.unshift(inst);
        return inst;
    }

    spawn(iid: Buffer, contractID: string, args: Argument[]) {
        return this.push(Instruction.createSpawn(iid, contractID, args));
    }

    invoke(iid: Buffer, contractID: string, command: string, args: Argument[]) {
        return this.push(Instruction.createInvoke(iid, contractID, command, args));
    }

    delete(iid: Buffer, contractID: string) {
        return this.push(Instruction.createDelete(iid, contractID));
    }

    toString(): string {
        return this.instructions.map((inst, i) => {
            const t = ["Spawn", "Invoke", "Delete"][inst.type];
            let cid: string;
            let args: Argument[];
            switch (inst.type) {
                case Instruction.typeSpawn:
                    cid = inst.spawn.contractID;
                    args = inst.spawn.args;
                    break;
                case Instruction.typeInvoke:
                    cid = `${inst.invoke.contractID} / ${inst.invoke.command}`;
                    args = inst.invoke.args;
                    break;
                case Instruction.typeDelete:
                    cid = inst.delete.contractID;
                    args = [];
                    break;
            }
            return `${i}:  ${t} ${cid}: ${inst.instanceID.toString("hex")}\n\t` +
                args.map((kv) => `${kv.name}: ${kv.value.toString("hex")}`).join("\n\t");
        }).join("\n\n");
    }
}