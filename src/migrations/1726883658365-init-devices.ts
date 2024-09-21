import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDevices1726883658365 implements MigrationInterface {
    name = 'InitDevices1726883658365'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deviceId" character varying NOT NULL, "name" character varying NOT NULL, "isConnected" boolean NOT NULL DEFAULT false, "lastConnection" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "UQ_666c9b59efda8ca85b29157152c" UNIQUE ("deviceId"), CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "devices" ADD CONSTRAINT "FK_e8a5d59f0ac3040395f159507c6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "FK_e8a5d59f0ac3040395f159507c6"`);
        await queryRunner.query(`DROP TABLE "devices"`);
    }

}
