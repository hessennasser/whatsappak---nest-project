import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

@Entity('devices')
export class Device {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    deviceId: string;

    @Column()
    name: string;

    @Column({ default: false })
    isConnected: boolean;

    @Column({ nullable: true })
    lastConnection: Date;

    @ManyToOne(() => User, user => user.devices)
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}