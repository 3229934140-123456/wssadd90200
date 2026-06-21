import React, { useState, useMemo } from 'react';
import { View, Text, Input, Picker, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import BigButton from '@/components/BigButton';
import classnames from 'classnames';
import type { UserInfo, SurgeryPlan } from '@/types';
import { defaultSurgeryPlan } from '@/data/mockData';
import { addDays } from '@/utils';

const PROJECT_OPTIONS = [
  '双眼皮手术', '隆鼻手术', '面部除皱', '瘦脸针',
  '玻尿酸填充', '自体脂肪填充', '隆下巴', '祛眼袋',
  '激光美容', '水光针', '热玛吉', '超声刀',
  '吸脂塑形', '隆胸手术', '私密整形', '其他项目'
];

const NurseSetupPage: React.FC = () => {
  const { userInfo, isProfileSetup, saveProfile, resetAllData, getActiveRecord } = useAppContext();
  const activeRecord = getActiveRecord();

  const initialPlan = activeRecord?.surgeryPlan;

  const [name, setName] = useState(isProfileSetup ? userInfo.name : '');
  const [age, setAge] = useState(isProfileSetup ? String(userInfo.age) : '');
  const [phone, setPhone] = useState(isProfileSetup ? userInfo.phone : '');
  const [selectedProject, setSelectedProject] = useState(isProfileSetup ? userInfo.projectName : '');
  const [customProject, setCustomProject] = useState('');
  const [surgeryDate, setSurgeryDate] = useState(isProfileSetup ? userInfo.surgeryDate : '');
  const [nurseName, setNurseName] = useState(isProfileSetup ? userInfo.nurseName : '');
  const [nursePhone, setNursePhone] = useState(isProfileSetup ? userInfo.nursePhone : '');
  const [storeName, setStoreName] = useState(isProfileSetup ? userInfo.storeName : '');
  const [familyName, setFamilyName] = useState(isProfileSetup ? (userInfo.familyName || '') : '');
  const [familyPhone, setFamilyPhone] = useState(isProfileSetup ? (userInfo.familyPhone || '') : '');

  // 术后计划字段
  const [stitchRemovalDate, setStitchRemovalDate] = useState(
    initialPlan?.stitchRemovalDate || (surgeryDate ? addDays(surgeryDate, 7) : '')
  );
  const [dailyCareFocus, setDailyCareFocus] = useState(
    initialPlan?.dailyCareFocus || defaultSurgeryPlan.dailyCareFocus
  );
  const [forbiddenInstructions, setForbiddenInstructions] = useState(
    initialPlan?.forbiddenInstructions || defaultSurgeryPlan.forbiddenInstructions
  );
  const [followUpReminder, setFollowUpReminder] = useState(
    initialPlan?.followUpReminder || defaultSurgeryPlan.followUpReminder
  );
  const [medicationPlan, setMedicationPlan] = useState(
    initialPlan?.medicationPlan || defaultSurgeryPlan.medicationPlan
  );
  const [nextFollowUp, setNextFollowUp] = useState(activeRecord?.nextFollowUp || '');

  // 选好手术日期后，自动计算拆线日期（默认7天）
  React.useEffect(() => {
    if (surgeryDate && !stitchRemovalDate) {
      setStitchRemovalDate(addDays(surgeryDate, 7));
    }
  }, [surgeryDate, stitchRemovalDate]);

  const handleSelectProject = (project: string) => {
    setSelectedProject(project === selectedProject ? '' : project);
    setCustomProject('');
  };

  const handleDateChange = (e) => {
    setSurgeryDate(e.detail.value);
  };

  const handleStitchDateChange = (e) => {
    setStitchRemovalDate(e.detail.value);
  };

  const handleFollowUpDateChange = (e) => {
    setNextFollowUp(e.detail.value);
  };

  const handleSave = () => {
    const finalProject = selectedProject === '其他项目' ? customProject.trim() : selectedProject;

    if (!name.trim()) {
      Taro.showToast({ title: '请输入顾客姓名', icon: 'none' }); return;
    }
    if (!age.trim() || isNaN(Number(age))) {
      Taro.showToast({ title: '请输入正确的年龄', icon: 'none' }); return;
    }
    if (!finalProject) {
      Taro.showToast({ title: '请选择医美项目', icon: 'none' }); return;
    }
    if (!surgeryDate) {
      Taro.showToast({ title: '请选择手术日期', icon: 'none' }); return;
    }
    if (!nurseName.trim()) {
      Taro.showToast({ title: '请输入护士姓名', icon: 'none' }); return;
    }
    if (!nursePhone.trim()) {
      Taro.showToast({ title: '请输入护士电话', icon: 'none' }); return;
    }
    if (!storeName.trim()) {
      Taro.showToast({ title: '请输入门店名称', icon: 'none' }); return;
    }

    Taro.showModal({
      title: '确认保存',
      content: `顾客：${name}\n项目：${finalProject}\n手术日期：${surgeryDate}\n拆线日期：${stitchRemovalDate || '术后7天'}\n护士：${nurseName}\n家属：${familyName || '未绑定'}\n\n确认保存建档信息？`,
      success: (res) => {
        if (res.confirm) {
          const profile: UserInfo = {
            name: name.trim(),
            age: Number(age),
            phone: phone.trim() || '未填写',
            projectName: finalProject,
            surgeryDate,
            nurseName: nurseName.trim(),
            nursePhone: nursePhone.trim(),
            storeName: storeName.trim(),
            familyName: familyName.trim() || undefined,
            familyPhone: familyPhone.trim() || undefined
          };

          const plan: SurgeryPlan = {
            stitchRemovalDate: stitchRemovalDate || undefined,
            dailyCareFocus: dailyCareFocus.trim(),
            forbiddenInstructions: forbiddenInstructions.trim(),
            tabooNotes: forbiddenInstructions.trim(),
            followUpReminder: followUpReminder.trim(),
            medicationPlan: medicationPlan.trim() || undefined
          };

          saveProfile(profile, plan, nextFollowUp || undefined);
          Taro.showToast({ title: '建档成功！', icon: 'success', duration: 2000 });
          setTimeout(() => {
            Taro.switchTab({ url: '/pages/home/index' });
          }, 1500);
        }
      }
    });
  };

  const handleReset = () => {
    Taro.showModal({
      title: '重置数据',
      content: '确定要重置所有数据吗？这将清除顾客信息、照护记录和复诊记录，恢复为演示数据。',
      success: (res) => {
        if (res.confirm) {
          resetAllData();
          Taro.showToast({ title: '已重置为演示数据', icon: 'success' });
          setTimeout(() => {
            setName('张阿姨');
            setAge('58');
            setPhone('138****5678');
            setSelectedProject('双眼皮手术');
            setSurgeryDate('2026-06-18');
            setNurseName('李护士');
            setNursePhone('400-123-4567');
            setStoreName('美丽人生医美中心（朝阳店）');
            setFamilyName('王女士（女儿）');
            setFamilyPhone('139****8765');
            setStitchRemovalDate(addDays('2026-06-18', 7));
            setDailyCareFocus(defaultSurgeryPlan.dailyCareFocus);
            setForbiddenInstructions(defaultSurgeryPlan.forbiddenInstructions);
            setFollowUpReminder(defaultSurgeryPlan.followUpReminder);
            setMedicationPlan(defaultSurgeryPlan.medicationPlan);
            setNextFollowUp('2026-06-25');
          }, 500);
        }
      }
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerIcon}>👩‍⚕️</Text>
        <Text className={styles.headerTitle}>院内护士建档</Text>
        <Text className={styles.headerSubtitle}>
          为顾客建立术后恢复档案，选择项目、制定术后计划、绑定家属，{'\n'}保存后顾客端和家属端同步可见
        </Text>
      </View>

      {isProfileSetup && (
        <View className={styles.existingProfile}>
          <Text className={styles.existingTitle}>📋 当前已有建档信息</Text>
          <Text className={styles.existingInfo}>
            顾客：{userInfo.name}（{userInfo.age}岁）{'\n'}
            项目：{userInfo.projectName}{'\n'}
            手术日期：{userInfo.surgeryDate}{'\n'}
            护士：{userInfo.nurseName}{'\n'}
            家属：{userInfo.familyName || '未绑定'}{'\n\n'}
            修改后点保存即可同步更新
          </Text>
        </View>
      )}

      <View className={styles.formCard}>
        <Text className={styles.formTitle}>👤 顾客信息</Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>顾客姓名<Text className={styles.formRequired}>*</Text></Text>
          <Input
            className={styles.formInput}
            placeholder="请输入顾客姓名"
            placeholderClass={styles.formInputPlaceholder}
            value={name}
            onInput={(e) => setName(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>年龄<Text className={styles.formRequired}>*</Text></Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="请输入年龄"
            placeholderClass={styles.formInputPlaceholder}
            value={age}
            onInput={(e) => setAge(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>联系电话</Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="请输入联系电话"
            placeholderClass={styles.formInputPlaceholder}
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.formTitle}>🏥 医美项目</Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>选择项目<Text className={styles.formRequired}>*</Text></Text>
          <View className={styles.projectGrid}>
            {PROJECT_OPTIONS.map((project) => (
              <View
                key={project}
                className={classnames(
                  styles.projectItem,
                  selectedProject === project && styles.projectItemSelected
                )}
                onClick={() => handleSelectProject(project)}
              >
                <Text className={selectedProject === project ? styles.projectTextSelected : styles.projectText}>
                  {project}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {selectedProject === '其他项目' && (
          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>自定义项目名<Text className={styles.formRequired}>*</Text></Text>
            <Input
              className={styles.formInput}
              placeholder="请输入项目名称"
              placeholderClass={styles.formInputPlaceholder}
              value={customProject}
              onInput={(e) => setCustomProject(e.detail.value)}
            />
          </View>
        )}

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>手术日期<Text className={styles.formRequired}>*</Text></Text>
          <Picker mode="date" value={surgeryDate} onChange={handleDateChange}>
            <View className={styles.formPicker}>
              <Text className={surgeryDate ? styles.pickerText : styles.pickerPlaceholder}>
                {surgeryDate || '请选择手术日期'}
              </Text>
              <Text className={styles.pickerArrow}>▼</Text>
            </View>
          </Picker>
        </View>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.formTitle}>📋 术后恢复计划</Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>拆线日期</Text>
          <Picker mode="date" value={stitchRemovalDate} onChange={handleStitchDateChange}>
            <View className={styles.formPicker}>
              <Text className={stitchRemovalDate ? styles.pickerText : styles.pickerPlaceholder}>
                {stitchRemovalDate || '默认术后第7天拆线'}
              </Text>
              <Text className={styles.pickerArrow}>▼</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>下次复诊日期</Text>
          <Picker mode="date" value={nextFollowUp} onChange={handleFollowUpDateChange}>
            <View className={styles.formPicker}>
              <Text className={nextFollowUp ? styles.pickerText : styles.pickerPlaceholder}>
                {nextFollowUp || '请选择下次复诊日期（可不填）'}
              </Text>
              <Text className={styles.pickerArrow}>▼</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>每天护理重点</Text>
          <Input
            type="textarea"
            className={styles.formTextarea}
            value={dailyCareFocus}
            onInput={(e) => setDailyCareFocus(e.detail.value)}
            maxlength={500}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>禁忌说明</Text>
          <Input
            type="textarea"
            className={styles.formTextarea}
            value={forbiddenInstructions}
            onInput={(e) => setForbiddenInstructions(e.detail.value)}
            maxlength={500}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>复诊提醒</Text>
          <Input
            type="textarea"
            className={styles.formTextarea}
            value={followUpReminder}
            onInput={(e) => setFollowUpReminder(e.detail.value)}
            maxlength={500}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>用药计划</Text>
          <Input
            type="textarea"
            className={styles.formTextarea}
            value={medicationPlan}
            onInput={(e) => setMedicationPlan(e.detail.value)}
            placeholder="如：头孢克肟每天2次每次1粒，吃5天"
            placeholderClass={styles.formInputPlaceholder}
            maxlength={500}
          />
        </View>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.formTitle}>👩‍⚕️ 护士与门店</Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>负责护士姓名<Text className={styles.formRequired}>*</Text></Text>
          <Input
            className={styles.formInput}
            placeholder="请输入护士姓名"
            placeholderClass={styles.formInputPlaceholder}
            value={nurseName}
            onInput={(e) => setNurseName(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>护士电话<Text className={styles.formRequired}>*</Text></Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="顾客一键拨打的电话号码"
            placeholderClass={styles.formInputPlaceholder}
            value={nursePhone}
            onInput={(e) => setNursePhone(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>门店名称<Text className={styles.formRequired}>*</Text></Text>
          <Input
            className={styles.formInput}
            placeholder="如：美丽人生医美中心（朝阳店）"
            placeholderClass={styles.formInputPlaceholder}
            value={storeName}
            onInput={(e) => setStoreName(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.familySection}>
        <Text className={styles.familyTitle}>👨‍👩‍👧 绑定家属（选填）</Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>家属称呼</Text>
          <Input
            className={styles.formInput}
            placeholder="如：王女士（女儿）、李先生（老伴）"
            placeholderClass={styles.formInputPlaceholder}
            value={familyName}
            onInput={(e) => setFamilyName(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>家属电话</Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="家属联系电话"
            placeholderClass={styles.formInputPlaceholder}
            value={familyPhone}
            onInput={(e) => setFamilyPhone(e.detail.value)}
          />
        </View>
      </View>

      <BigButton text="保存建档信息和术后计划" icon="💾" type="primary" onClick={handleSave} />
      <View style={{ height: 16 }} />
      <BigButton text="重置为演示数据" icon="🔄" type="default" onClick={handleReset} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default NurseSetupPage;
