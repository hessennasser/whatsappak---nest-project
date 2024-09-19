import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50 })
    firstName: string;

    @Column({ length: 50 })
    lastName: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ unique: true, length: 30 })
    username: string;

    @Column()
    @Exclude()
    password: string;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
    role: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }

    // Helper method to check password
    async comparePassword(attempt: string): Promise<boolean> {
        return bcrypt.compare(attempt, this.password);
    }
}